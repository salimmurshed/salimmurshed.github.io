import fetch from "node-fetch";

function formatDate(dateStr) {
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

  return `${month} ${day}, ${year}`;
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

    allDays.sort((a, b) => new Date(a.date) - new Date(b.date));

    let longestStreak = 0;
    let currentStreakCount = 0;
    let tempStreakCount = 0;

    for (const day of allDays) {
      if (day.contributionCount > 0) {
        tempStreakCount++;
        if (tempStreakCount > longestStreak) {
          longestStreak = tempStreakCount;
        }
      } else {
        tempStreakCount = 0;
      }
    }

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
        while (idx >= 0 && allDays[idx].contributionCount > 0) {
          currentStreakCount++;
          idx--;
        }
      }
    }

    const overallDateRange = `${formatDate(joinedDate)} - Present`;

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
        <text x="70" y="85" text-anchor="middle" class="text bold pink" font-size="42">${totalContributions.toLocaleString()}</text>
        <text x="70" y="122" text-anchor="middle" class="text pink" font-size="16">Total Contributions</text>
      </g>

      <line x1="165" y1="20" x2="165" y2="150" stroke="#44415C" stroke-opacity="0.8"/>

      <!-- Current Streak (সার্কেল, আগুন, সংখ্যা ও লেখাকে একবারে নিচে তারিখের ওপরে বসানো হয়েছে) -->
      <g transform="translate(170, 0)">
        <circle cx="77" cy="88" r="38" fill="#141321" stroke="#E94B8A" stroke-width="4"/>
        
        <g transform="translate(68, 43) scale(0.6)">
          <path d="M12 0C7.5 3 6.3 6.7 6 9c-.3 2.3.9 3.6 1 4.5.1.9-.8.7-1.1-.1s-1.8-3.4-1.8-6.4C1 8.8 0 11 0 13.5 0 17 2 20 6.5 20S12 17.5 12 14c0-3.1-2.2-6.6-2.2-6.6C12 7.7 13 8.8 13.2 11c1 2.2 2 3.8 2.2 6.1C16.8 18.2 18 16 18 13.5 18 9.5 15.5 3 12 0z" fill="#E94B8A"/>
        </g>
        
        <text x="77" y="98" text-anchor="middle" class="text bold yellow" font-size="30">${currentStreakCount}</text>
        
        <!-- তারিখের ঠিক ওপরের লাইনে 'Current Streak' -->
        <text x="77" y="148" text-anchor="middle" class="text bold yellow" font-size="16">Current Streak</text>
      </g>

      <line x1="330" y1="20" x2="330" y2="150" stroke="#44415C" stroke-opacity="0.8"/>

      <!-- Longest Streak -->
      <g transform="translate(335, 0)">
        <text x="70" y="85" text-anchor="middle" class="text bold pink" font-size="42">${longestStreak}</text>
        <text x="70" y="122" text-anchor="middle" class="text pink" font-size="16">Longest Streak</text>
      </g>

      <!-- কার্ডের একদম নিচের তারিখ -->
      <text x="247" y="176" text-anchor="middle" class="text light-blue" font-size="13.5">${overallDateRange}</text>
    </svg>
    `;

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    return res.status(200).send(svg);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
