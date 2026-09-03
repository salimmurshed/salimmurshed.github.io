export default async function handler(req, res) {
  const { username = "salimmurshed", year = new Date().getFullYear() } =
    req.query;
  const token = process.env.GITHUB_TOKEN;

  res.setHeader("Content-Type", "image/svg+xml");

  if (!token) {
    return res.status(500).send(`
      <svg xmlns="http://www.w3.org/2000/svg" width="450" height="50">
        <text x="20" y="30" fill="red" font-family="sans-serif" font-size="12">Error: GITHUB_TOKEN environment variable is missing.</text>
      </svg>
    `);
  }

  try {
    const fromDate = `${year}-01-01T00:00:00Z`;
    const toDate = `${year}-12-31T23:59:59Z`;

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
                totalContributions
                contributionCalendar {
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
          from: fromDate,
          to: toDate,
        },
      }),
    });

    const json = await response.json();
    const collection = json.data?.user?.contributionsCollection;

    if (!collection) {
      throw new Error("Invalid response or user not found");
    }

    const totalContributions = collection.totalContributions;
    const weeks = collection.contributionCalendar.weeks;

    const boxSize = 10;
    const gap = 3;
    const cols = weeks.length;
    const width = cols * (boxSize + gap) + 40;
    const height = 150;

    let svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <style>
          text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; fill: #57606a; font-size: 12px; }
          .header { font-weight: 600; font-size: 14px; fill: #24292f; }
        </style>
        <rect width="100%" height="100%" rx="6" fill="#ffffff" stroke="#d0d7de" stroke-width="1"/>
        <text x="20" y="28" class="header">${totalContributions} contributions in ${year}</text>
        <g transform="translate(20, 45)">
    `;

    weeks.forEach((week, wIndex) => {
      week.contributionDays.forEach((day, dIndex) => {
        const x = wIndex * (boxSize + gap);
        const y = dIndex * (boxSize + gap);
        svgContent += `<rect x="${x}" y="${y}" width="${boxSize}" height="${boxSize}" rx="2" fill="${day.color}"><title>${day.date}: ${day.contributionCount} contributions</title></rect>`;
      });
    });

    svgContent += `</g></svg>`;

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    return res.status(200).send(svgContent);
  } catch (error) {
    return res.status(500).send(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="50">
        <text x="20" y="30" fill="red" font-family="sans-serif" font-size="12">Failed to load contributions graph.</text>
      </svg>
    `);
  }
}
