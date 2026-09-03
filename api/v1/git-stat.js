export default async function handler(req, res) {
  const { username = "salimmurshed", year = 2024 } = req.query;
  const token = process.env.GITHUB_TOKEN;

  res.setHeader("Content-Type", "image/svg+xml");

  if (!token) {
    return res.status(200).send(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="50">
        <text x="10" y="30" fill="red" font-size="12">Error: GITHUB_TOKEN is missing</text>
      </svg>
    `);
  }

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query($userName: String!, $from: DateTime!, $to: DateTime!) {
            user(login: $userName) {
              contributionsCollection(from: $from, to: $to) {
                contributionCalendar {
                  totalContributions
                  weeks {
                    contributionDays {
                      contributionCount
                      date
                      color
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          userName: username,
          from: `${year}-01-01T00:00:00Z`,
          to: `${year}-12-31T23:59:59Z`,
        },
      }),
    });

    const json = await response.json();
    if (json.errors) {
      return res.status(200).send(`
        <svg xmlns="http://www.w3.org/2000/svg" width="500" height="50">
          <text x="10" y="30" fill="red" font-size="11">GQL Error: ${json.errors[0].message}</text>
        </svg>
      `);
    }

    const calendar =
      json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) {
      return res.status(200).send(`
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="50">
          <text x="10" y="30" fill="red" font-size="12">No data found for user</text>
        </svg>
      `);
    }

    const weeks = calendar.weeks;
    const total = calendar.totalContributions;

    const boxSize = 10;
    const gap = 3;
    const width = weeks.length * (boxSize + gap) + 40;
    const height = 130;

    let svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <style>
          text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; fill: #57606a; font-size: 12px; }
          .header { font-weight: 600; font-size: 14px; fill: #24292f; }
        </style>
        <rect width="100%" height="100%" rx="6" fill="#ffffff" stroke="#d0d7de" stroke-width="1"/>
        <text x="20" y="28" class="header">${total} contributions in ${year}</text>
        <g transform="translate(20, 42)">
    `;

    weeks.forEach((week, wIdx) => {
      week.contributionDays.forEach((day, dIdx) => {
        const x = wIdx * (boxSize + gap);
        const y = dIdx * (boxSize + gap);
        svg += `<rect x="${x}" y="${y}" width="${boxSize}" height="${boxSize}" rx="2" fill="${day.color}"><title>${day.date}: ${day.contributionCount} contributions</title></rect>`;
      });
    });

    svg += `</g></svg>`;

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    return res.status(200).send(svg);
  } catch (err) {
    return res.status(200).send(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="50">
        <text x="10" y="30" fill="red" font-size="12">Error: ${err.message}</text>
      </svg>
    `);
  }
}
