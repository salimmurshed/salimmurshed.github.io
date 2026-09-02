import fetch from "node-fetch";

// তারিখ ফরম্যাট করার ফাংশন (যেমন: Oct 31, 2017 বা Mar 14)
function formatDate(dateStr, includeYear = true) {
  const date = new Date(dateStr);
  if (isNaN(date)) return "Present";
  const options = { month: "short", day: "numeric" };
  if (includeYear) options.year = "numeric";
  return date.toLocaleDateString("en-US", options);
}

// তারিখের রেঞ্জ ফরম্যাট করার ফাংশন
function formatDateRange(start, end, includeYear = true) {
  if (!start) return "";
  const endFormatted = formatDate(end, includeYear);
  return `${formatDate(start, includeYear)} - ${endFormatted}`;
}

export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN;
  const username = req.query.username || "salimmurshed";

  if (!token) {
    return res
      .status(500)
      .json({
        error: "Server error: GITHUB_TOKEN environment variable is missing.",
      });
  }

  try {
    // ১. ইউজার অ্যাকাউন্ট তৈরির তারিখ আনা (Total Contributions-এর শুরু থেকে বর্তমান পর্যন্ত)
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

    const startYear = new Date(userData.data.user.createdAt).getFullYear();
    const currentYear = new Date().getFullYear();
    const joinedDate = userData.data.user.createdAt;

    let totalContributions = 0;
    const allDays = [];

    // ২. শুরু থেকে বর্তমান বছর পর্যন্ত কন্ট্রিবিউশন ডেটা আনা (এক বছরে ১ বছরের ডেটা)
    for (let year = startYear; year <= currentYear; year++) {
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
          to: `${year}-12-31T23:59:59Z`,
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

    // ৩. স্ট্রাইক (Streak) এবং তারিখের হিসাব
    allDays.sort((a, b) => new Date(a.date) - new Date(b.date));

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

        if (tempStreakCount > longestStreak) {
          longestStreak = tempStreakCount;
          longestStreakStart = tempStreakStart;
          longestStreakEnd = day.date;
        }
      } else {
        tempStreakCount = 0;
        tempStreakStart = null;
      }
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const yesterdayStr = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    let idx = allDays.length - 1;
    // ফিউচার ডেট স্কিপ করা (যদি থাকে)
    while (idx >= 0 && allDays[idx].date > todayStr) idx--;

    // আজ বা গতকাল কন্ট্রিবিউশন আছে কিনা পরীক্ষা করা (Current Streak সচল রাখার জন্য)
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

    // ৪. ছবির মতো ডিজাইন (SVG) তৈরি
    const totalContrRange = `${formatDate(joinedDate, true)} - Present`;
    const longestStreakRange = formatDateRange(
      longestStreakStart,
      longestStreakEnd,
      true,
    );
    const currentStreakRange = formatDateRange(
      currentStreakStart,
      currentStreakEnd,
      true,
    );

    const svg = `
    <svg width="495" height="195" viewBox="0 0 495 195" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <style>
        .text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
        .pink { fill: #E94B8A; }
        .yellow { fill: #FFE480; }
        .light-blue { fill: #79D1C9; }
        .bold { font-weight: bold; }
      </style>
      
      <!-- ব্যাকগ্রাউন্ড -->
      <rect width="495" height="195" rx="10" fill="#141321"/>
      
      <!-- টোটাল কন্ট্রিবিউশন -->
      <g transform="translate(10, 0)">
        <text x="70" y="70" text-anchor="middle" class="text bold pink" font-size="42">${totalContributions.toLocaleString()}</text>
        <text x="70" y="105" text-anchor="middle" class="text pink" font-size="16">Total Contributions</text>
        <text x="70" y="140" text-anchor="middle" class="text light-blue" font-size="14">${totalContrRange}</text>
      </g>

      <!-- ভার্টিকাল লাইন ১ -->
      <line x1="165" y1="30" x2="165" y2="165" stroke="#44415C" stroke-opacity="0.8"/>

      <!-- কারেন্ট স্ট্রাইক (মাঝখানে) -->
      <g transform="translate(170, 0)">
        <!-- গোল চিহ্ন -->
        <circle cx="77" y="77" r="41" fill="#141321"/>
        <circle cx="77" y="77" r="41" stroke="#E94B8A" stroke-width="4"/>
        
        <!-- আগুনের লোগো -->
        <g transform="translate(68, 28) scale(0.6)">
          <path d="M12 0C7.5 3 6.3 6.7 6 9c-.3 2.3.9 3.6 1 4.5.1.9-.8.7-1.1-.1s-1.8-3.4-1.8-6.4C1 8.8 0 11 0 13.5 0 17 2 20 6.5 20S12 17.5 12 14c0-3.1-2.2-6.6-2.2-6.6C12 7.7 13 8.8 13.2 11c1 2.2 2 3.8 2.2 6.1C16.8 18.2 18 16 18 13.5 18 9.5 15.5 3 12 0z" fill="#E94B8A"/>
        </g>
        
        <text x="77" y="87" text-anchor="middle" class="text bold yellow" font-size="34">${currentStreakCount}</text>
        <text x="77" y="132" text-anchor="middle" class="text bold yellow" font-size="16">Current Streak</text>
        <text x="77" y="160" text-anchor="middle" class="text light-blue" font-size="14">${currentStreakRange}</text>
      </g>

      <!-- ভার্টিকাল লাইন ২ -->
      <line x1="330" y1="30" x2="330" y2="165" stroke="#44415C" stroke-opacity="0.8"/>

      <!-- লঙ্গেস্ট স্ট্রাইক -->
      <g transform="translate(335, 0)">
        <text x="70" y="70" text-anchor="middle" class="text bold pink" font-size="42">${longestStreak}</text>
        <text x="70" y="105" text-anchor="middle" class="text pink" font-size="16">Longest Streak</text>
        <text x="70" y="140" text-anchor="middle" class="text light-blue" font-size="14">${longestStreakRange}</text>
      </g>
      
    </svg>
    `;

    // ছবির মতো রিটার্ন করার জন্য হেডার সেট
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=3600"); // ১ ঘণ্টা ক্যাশ

    return res.status(200).send(svg);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
