// api/linkedin.js

export default async function handler(req, res) {
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader(
    "Cache-Control",
    "max-age=0, s-maxage=3600, stale-while-revalidate",
  );

  // 1. Get userId / username from query parameters
  const userId = req.query.userId || req.query.query;

  if (!userId) {
    return res.status(400).send(`
      <svg width="350" height="80" xmlns="http://www.w3.org/2000/svg">
        <text x="20" y="40" fill="red" font-family="sans-serif" font-size="14">Error: Missing 'userId' parameter</text>
      </svg>
    `);
  }

  try {
    // 2. Fetch data dynamically based on the userId
    // Example using an external profile provider or your own database/service:
    /*
    const response = await fetch(`https://api.your-provider.com/linkedin/profile?username=${userId}`, {
      headers: { 'Authorization': `Bearer ${process.env.API_KEY}` }
    });
    const profileData = await response.json();
    */

    // Placeholder object representing dynamic user data:
    const stats = {
      username: userId,
      followers: req.query.followers || "1,500",
      connections: req.query.connections || "500+",
      impressions: req.query.impressions || "10.2K",
    };

    // 3. Render the SVG with dynamic values
    const svg = `
      <svg width="360" height="170" viewBox="0 0 360 170" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>
          .header { font: 600 16px 'Segoe UI', Roboto, sans-serif; fill: #0A66C2; }
          .sub { font: 400 12px 'Segoe UI', Roboto, sans-serif; fill: #666666; }
          .label { font: 400 13px 'Segoe UI', Roboto, sans-serif; fill: #5E6E82; }
          .value { font: 600 14px 'Segoe UI', Roboto, sans-serif; fill: #1D2129; }
          .bg { fill: #FFFFFF; stroke: #E1E4E8; stroke-width: 1px; rx: 8px; }
        </style>

        <rect class="bg" width="359" height="169" x="0.5" y="0.5" />

        <!-- Header with Dynamic User Identifier -->
        <g transform="translate(20, 30)">
          <path fill="#0A66C2" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          <text x="30" y="14" class="header">LinkedIn Stats</text>
          <text x="30" y="28" class="sub">@${stats.username}</text>
        </g>

        <!-- Dynamic Data Metrics -->
        <g transform="translate(20, 85)">
          <text x="0" y="0" class="label">Followers:</text>
          <text x="320" y="0" class="value" text-anchor="end">${stats.followers}</text>

          <text x="0" y="25" class="label">Connections:</text>
          <text x="320" y="25" class="value" text-anchor="end">${stats.connections}</text>

          <text x="0" y="50" class="label">Post Impressions:</text>
          <text x="320" y="50" class="value" text-anchor="end">${stats.impressions}</text>
        </g>
      </svg>
    `;

    return res.status(200).send(svg);
  } catch (error) {
    return res.status(500).send(`
      <svg width="350" height="80" xmlns="http://www.w3.org/2000/svg">
        <text x="20" y="40" fill="red">Error fetching data for ${userId}</text>
      </svg>
    `);
  }
}
