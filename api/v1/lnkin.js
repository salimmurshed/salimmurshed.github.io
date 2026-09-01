export default async function handler(req, res) {
  // 1. Enable CORS so GitHub/external sites can render the image without security blocks
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // 2. Accept either 'query' or 'userId' from the URL parameters
  const targetUser = req.query.query || req.query.userId;

  if (!targetUser) {
    const errorSvg = `
      <svg width="400" height="60" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#fff0f0" rx="6" stroke="#ff4d4f"/>
        <text x="20" y="35" fill="#cf1322" font-family="Arial, sans-serif" font-size="14" font-weight="bold">
          Error: Missing query parameter (?query=username)
        </text>
      </svg>
    `;
    return res.status(200).send(errorSvg);
  }

  try {
    // 3. Define fallback/mock stats (or plug in your API fetch call here)
    const stats = {
      username: targetUser,
      followers: req.query.followers || "500+",
      connections: req.query.connections || "500+",
      impressions: req.query.impressions || "1.2K",
    };

    // 4. Build SVG Markup
    const svg = `
      <svg width="450" height="170" viewBox="0 0 450 170" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>
          .header { font: 600 16px 'Segoe UI', Ubuntu, sans-serif; fill: #0A66C2; }
          .user { font: 400 12px 'Segoe UI', Ubuntu, sans-serif; fill: #666; }
          .label { font: 400 13px 'Segoe UI', Ubuntu, sans-serif; fill: #5E6E82; }
          .value { font: 600 14px 'Segoe UI', Ubuntu, sans-serif; fill: #1D2129; }
          .card { fill: #FFFFFF; stroke: #E1E4E8; stroke-width: 1px; rx: 8px; }
        </style>
        
        <rect class="card" width="449" height="169" x="0.5" y="0.5" />

        <g transform="translate(20, 35)">
          <path fill="#0A66C2" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          <text x="32" y="14" class="header">LinkedIn Profile Analytics</text>
          <text x="32" y="28" class="user">@${stats.username}</text>
        </g>

        <g transform="translate(20, 90)">
          <text x="0" y="0" class="label">Followers:</text>
          <text x="400" y="0" class="value" text-anchor="end">${stats.followers}</text>

          <text x="0" y="25" class="label">Connections:</text>
          <text x="400" y="25" class="value" text-anchor="end">${stats.connections}</text>

          <text x="0" y="50" class="label">Post Impressions:</text>
          <text x="400" y="50" class="value" text-anchor="end">${stats.impressions}</text>
        </g>
      </svg>
    `;

    return res.status(200).send(svg);
  } catch (err) {
    const errorSvg = `
      <svg width="400" height="60" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#fff0f0" rx="6" stroke="#ff4d4f"/>
        <text x="20" y="35" fill="#cf1322" font-family="Arial, sans-serif" font-size="14">
          Internal Server Error: ${err.message}
        </text>
      </svg>
    `;
    return res.status(200).send(errorSvg);
  }
}
