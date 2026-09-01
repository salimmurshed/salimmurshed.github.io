// api/linkedin.js

export default async function handler(req, res) {
  // 1. Set headers so GitHub/Markdown renders it as an SVG image without caching issues
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader(
    "Cache-Control",
    "max-age=0, s-maxage=3600, stale-while-revalidate",
  );

  try {
    // 2. Fetch or calculate your statistics
    // Note: If using official LinkedIn API, fetch bearer token and call stats endpoint here.
    // Below is a structured response layout.
    const stats = {
      followers: req.query.followers || "1,250",
      connections: req.query.connections || "500+",
      postImpressions: req.query.impressions || "12.4K",
      profileViews: req.query.views || "450",
    };

    // 3. Generate SVG markup dynamically
    const svg = `
      <svg width="350" height="170" viewBox="0 0 350 170" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>
          .header { font: 600 16px 'Segoe UI', Ubuntu, Sans-Serif; fill: #0A66C2; }
          .stat-label { font: 400 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: #5E6E82; }
          .stat-value { font: 600 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: #1D2129; }
          .bg { fill: #FFFFFF; stroke: #E1E4E8; stroke-width: 1px; rx: 8px; }
        </style>
        
        <!-- Background Container -->
        <rect class="bg" width="349" height="169" x="0.5" y="0.5" />

        <!-- Header -->
        <g transform="translate(20, 35)">
          <path fill="#0A66C2" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          <text x="30" y="17" class="header">LinkedIn Analytics</text>
        </g>

        <!-- Stats List -->
        <g transform="translate(20, 75)">
          <!-- Row 1 -->
          <text x="0" y="0" class="stat-label">Followers:</text>
          <text x="200" y="0" class="stat-value" text-anchor="end">${stats.followers}</text>
          
          <!-- Row 2 -->
          <text x="0" y="25" class="stat-label">Connections:</text>
          <text x="200" y="25" class="stat-value" text-anchor="end">${stats.connections}</text>

          <!-- Row 3 -->
          <text x="0" y="50" class="stat-label">Post Impressions (30d):</text>
          <text x="200" y="50" class="stat-value" text-anchor="end">${stats.postImpressions}</text>
        </g>
      </svg>
    `;

    return res.status(200).send(svg);
  } catch (error) {
    return res
      .status(500)
      .send("<svg><text>Error generating stats</text></svg>");
  }
}
