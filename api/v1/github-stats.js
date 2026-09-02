import fetch from "node-fetch";

// তারিখ ফরম্যাট করার হেলপার ফাংশন
function formatDate(dateStr, includeYear = true) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[d.getUTCMonth()];
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();

  return includeYear ? `${month} ${day}, ${year}` : `${month} ${day}`;
}

export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN;
  const username = req.query.username || "salimmurshed";

  if (!token) {
    return res
      .status(500)
      .json({ error: "Server error: GITHUB_TOKEN is missing." });
  }

  try {
    // ১. ইউজার জয়েনিং ডেট আনা
    const userQuery = JSON.stringify({
      query: `query($login: String!) { user(login: $login) { createdAt } }`,
      variables: { login: username },
    });

    const userRes = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "Vercel-Api-Request",
      },
      body: userQuery,
    });

    const userData = await userRes.json();
    if (userData.errors)
      return res.status(400).json({ error: userData.errors });

    const joinedDate = userData.data.user.createdAt;
    const startYear = new Date(joinedDate).getUTCFullYear();
    const currentYear = new Date().getUTCFullYear();

    let totalContributions = 0;
    const allDays = [];

    // ২. অ্যাকাউন্ট তৈরির বছর থেকে শুরু করে বর্তমান বছর পর্যন্ত অল-টাইম ডেটা আনা
    for (let year = startYear; year <= currentYear; year++) {
      const isCurrentYear = year === currentYear;
      const toDate = isCurrentYear
        ? new Date().toISOString()
        : `${year}-12-31T23:59:59Z`;

      const calQuery = JSON.stringify({
        query: `query($login: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $login) {
            contributionsCollection(from: $from, to: $to) {
              contributionCalendar {
                totalContributions
                weeks { contributionDays { contributionCount date } }
              }
            }
          }
        }`,
        variables: {
          login: username,
          from: `${year}-01-01T00:00:00Z`,
          to: toDate,
        },
      });

      const calRes = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "Vercel-Api-Request",
        },
        body: calQuery,
      });

      const calData = await calRes.json();
      if (!calData.data || !calData.data.user) continue;

      const calendar =
        calData.data.user.contributionsCollection.contributionCalendar;
      totalContributions += calendar.totalContributions;

      calendar.weeks.forEach((week) => {
        week.contributionDays.forEach((day) => allDays.push(day));
      });
    }

    // ৩. তারিখ অনুযায়ী শর্ট করা (Ascending Order)
    allDays.sort((a, b) => new Date(a.date) - new Date(b.date));

    // ৪. Longest Streak & Current Streak ডাইনামিক ক্যালকুলেশন
    let longestStreak = 0;
    let longestStreakStart = null;
    let longestStreakEnd = null;

    let currentStreakCount = 0;
    let currentStreakStart = null;
    let currentStreakEnd = null;

    let tempStreakCount = 0;
    let tempStreakStart = null;

    for (const day of allDays) {
      if (day.contributionCount > 0) {
        if (tempStreakCount === 0) tempStreakStart = day.date;
        tempStreakCount++;

        if (tempStreakCount >= longestStreak) {
          longestStreak = tempStreakCount;
          longestStreakStart = tempStreakStart;
          longestStreakEnd = day.date;
        }
      } else {
        tempStreakCount = 0;
        tempStreakStart = null;
      }
    }

    // Current Streak বের করার লজিক (আজ এবং গতকাল ম্যাচ করে)
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const yDay = new Date(now);
    yDay.setUTCDate(yDay.getUTCDate() - 1);
    const yesterdayStr = yDay.toISOString().split("T")[0];

    let idx = allDays.length - 1;
    while (idx >= 0 && allDays[idx].date > todayStr) idx--;

    if (
      idx >= 0 &&
      (allDays[idx].date === todayStr || allDays[idx].date === yesterdayStr)
    ) {
      if (allDays[idx].contributionCount > 0) {
        currentStreakEnd = allDays[idx].date;
        currentStreakCount = 0;

        while (idx >= 0 && allDays[idx].contributionCount > 0) {
          currentStreakStart = allDays[idx].date;
          currentStreakCount++;
          idx--;
        }
      }
    }

    // ৫. ডায়নামিক তারিখ ফরম্যাটিং (ইমেজ লেআউট অনুযায়ী)
    // Left Box: Oct 31, 2017 - Present
    const totalContrRange = `${formatDate(joinedDate, true)} - Present`;

    // Center Box: Aug 31 - Sep 2 (বছর ছাড়া শর্ট তারিখ)
    const currentStreakRange =
      currentStreakCount > 0
        ? `${formatDate(currentStreakStart, false)} - ${formatDate(currentStreakEnd, false)}`
        : "No Active Streak";

    // Right Box: Mar 14 - Mar 20 (বছরের প্রয়োজন অনুযায়ী)
    const longestStreakRange =
      longestStreak > 0
        ? `${formatDate(longestStreakStart, false)} - ${formatDate(longestStreakEnd, false)}`
        : "No Streak";

    // ৬. SVG কার্ড আউটপুট
    const svg = `
    <svg width="495" height="195" viewBox="0 0 495 195" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        .text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .pink { fill: #E94B8A; }
        .yellow { fill: #FFE480; }
        .light-blue { fill: #79D1C9; }
        .bold { font-weight: bold; }
      </style>
      
      <rect width="495" height="195" rx="10" fill="#141321"/>
      
      <!-- Total Contributions -->
      <g transform="translate(10, 0)">
        <text x="70" y="70" text-anchor="middle" class="text bold pink" font-size="42">${totalContributions.toLocaleString()}</text>
        <text x="70" y="105" text-anchor="middle" class="text pink" font-size="16">Total Contributions</text>
        <text x="70" y="140" text-anchor="middle" class="text light-blue" font-size="13">${totalContrRange}</text>
      </g>

      <line x1="165" y1="30" x2="165" y2="165" stroke="#44415C" stroke-opacity="0.8"/>

      <!-- Current Streak -->
      <g transform="translate(170, 0)">
        <circle cx="77" y="77" r="41" fill="#141321"/>
        <circle cx="77" y="77" r="41" stroke="#E94B8A" stroke-width="4"/>
        
        <g transform="translate(68, 28) scale(0.6)">
          <path d="M12 0C7.5 3 6.3 6.7 6 9c-.3 2.3.9 3.6 1 4.5.1.9-.8.7-1.1-.1s-1.8-3.4-1.8-6.4C1 8.8 0 11 0 13.5 0 17 2 20 6.5 20S12 17.5 12 14c0-3.1-2.2-6.6-2.2-6.6C12 7.7 13 8.8 13.2 11c1 2.2 2 3.8 2.2 6.1C16.8 18.2 18 16 18 13.5 18 9.5 15.5 3 12 0z" fill="#E94B8A"/>
        </g>
        
        <text x="77" y="87" text-anchor="middle" class="text bold yellow" font-size="34">${currentStreakCount}</text>
        <text x="77" y="132" text-anchor="middle" class="text bold yellow" font-size="16">Current Streak</text>
        <text x="77" y="160" text-anchor="middle" class="text light-blue" font-size="13">${currentStreakRange}</text>
      </g>

      <line x1="330" y1="30" x2="330" y2="165" stroke="#44415C" stroke-opacity="0.8"/>

      <!-- Longest Streak -->
      <g transform="translate(335, 0)">
        <text x="70" y="70" text-anchor="middle" class="text bold pink" font-size="42">${longestStreak}</text>
        <text x="70" y="105" text-anchor="middle" class="text pink" font-size="16">Longest Streak</text>
        <text x="70" y="140" text-anchor="middle" class="text light-blue" font-size="13">${longestStreakRange}</text>
      </g>
    </svg>
    `;

    // ক্যাশিং বন্ধ করা হলো যেন লাইভ রিফ্রেশ ডেটা রিয়েলটাইমে চেঞ্জ হয়
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    return res.status(200).send(svg);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
