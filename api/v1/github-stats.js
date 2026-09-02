import fetch from "node-fetch";

export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN;
  const username = req.query.username || "salimmurshed";

  if (!token) {
    res.setHeader("Content-Type", "image/svg+xml");
    return res
      .status(500)
      .send(getErrorSvg("GITHUB_TOKEN is missing on Vercel"));
  }

  try {
    // 1. Fetch account creation date
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
    if (userData.errors || !userData.data?.user) {
      res.setHeader("Content-Type", "image/svg+xml");
      return res.status(400).send(getErrorSvg(`User '${username}' not found`));
    }

    const startYear = new Date(userData.data.user.createdAt).getFullYear();
    const currentYear = new Date().getFullYear();

    // 2. Fetch all years in PARALLEL to prevent Vercel 10s timeout
    const years = [];
    for (let year = startYear; year <= currentYear; year++) {
      years.push(year);
    }

    const promises = years.map((year) => {
      const calQuery = JSON.stringify({
        query: `query($login: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $login) {
            contributionsCollection(from: $from, to: $to) {
              contributionCalendar { totalContributions }
            }
          }
        }`,
        variables: {
          login: username,
          from: `${year}-01-01T00:00:00Z`,
          to: `${year}-12-31T23:59:59Z`,
        },
      });

      return fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "Vercel-Api-Request",
        },
        body: calQuery,
      })
        .then((r) => r.json())
        .then(
          (d) =>
            d.data?.user?.contributionsCollection?.contributionCalendar
              ?.totalContributions || 0,
        );
    });

    const results = await Promise.all(promises);
    const totalContributions = results.reduce((acc, curr) => acc + curr, 0);

    // 3. Generate SVG Markup
    const svg = `
      <svg width="495" height="195" viewBox="0 0 495 195" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>
          .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: #2f80ed; }
          .stat-label { font: 400 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: #434d58; }
          .stat-value { font: 600 22px 'Segoe UI', Ubuntu, Sans-Serif; fill: #333333; }
        </style>
        <rect x="0.5" y="0.5" width="494" height="194" rx="4.5" fill="#fffefe" stroke="#e4e2e2"/>
        <text x="25" y="35" class="header">${username}'s GitHub Stats</text>
        
        <text x="25" y="85" class="stat-label">Total All-Time Contributions</text>
        <text x="25" y="115" class="stat-value">${totalContributions.toLocaleString()}</text>
        
        <text x="25" y="150" class="stat-label">Years Active</text>
        <text x="25" y="175" class="stat-value">${startYear} - ${currentYear}</text>
      </svg>
    `;

    // 4. Set headers for SVG rendering & caching
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=14400, s-maxage=14400"); // Cache for 4 hours

    return res.status(200).send(svg);
  } catch (error) {
    res.setHeader("Content-Type", "image/svg+xml");
    return res.status(500).send(getErrorSvg(error.message));
  }
}

function getErrorSvg(message) {
  return `
    <svg width="495" height="120" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#fff0f0" stroke="#ff4d4d" rx="5"/>
      <text x="20" y="40" fill="#cc0000" font-family="sans-serif" font-weight="bold" font-size="14">Error Loading Stats</text>
      <text x="20" y="70" fill="#333" font-family="sans-serif" font-size="12">${message}</text>
    </svg>
  `;
}
