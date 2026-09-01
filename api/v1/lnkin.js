export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Dynamic query parameters
  const username = String(req.query.query || req.query.userId || "Unknown");

  const followers = String(req.query.followers || "0");
  const connections = String(req.query.connections || "0");
  const impressions = String(req.query.impressions || "0");

  // Escape SVG/XML characters
  const escapeXml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const svg = `
<svg width="450" height="170"
     viewBox="0 0 450 170"
     fill="none"
     xmlns="http://www.w3.org/2000/svg">

  <style>
    .header {
      font: 600 16px 'Segoe UI', Ubuntu, sans-serif;
      fill: #0A66C2;
    }

    .user {
      font: 400 12px 'Segoe UI', Ubuntu, sans-serif;
      fill: #666;
    }

    .label {
      font: 400 13px 'Segoe UI', Ubuntu, sans-serif;
      fill: #5E6E82;
    }

    .value {
      font: 600 14px 'Segoe UI', Ubuntu, sans-serif;
      fill: #1D2129;
    }

    .card {
      fill: #FFFFFF;
      stroke: #E1E4E8;
      stroke-width: 1px;
    }
  </style>

  <!-- Card -->
  <rect
    class="card"
    width="449"
    height="169"
    x="0.5"
    y="0.5"
    rx="8"
  />

  <!-- Header -->
  <g transform="translate(20, 35)">

    <!-- LinkedIn Icon -->
    <path
      fill="#0A66C2"
      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
    />

    <text x="32" y="14" class="header">
      LinkedIn Profile Analytics
    </text>

    <text x="32" y="28" class="user">
      @${escapeXml(username)}
    </text>

  </g>


  <!-- Stats -->
  <g transform="translate(20, 90)">

    <text x="0" y="0" class="label">
      Followers:
    </text>

    <text
      x="400"
      y="0"
      class="value"
      text-anchor="end"
    >
      ${escapeXml(followers)}
    </text>


    <text x="0" y="25" class="label">
      Connections:
    </text>

    <text
      x="400"
      y="25"
      class="value"
      text-anchor="end"
    >
      ${escapeXml(connections)}
    </text>


    <text x="0" y="50" class="label">
      Post Impressions:
    </text>

    <text
      x="400"
      y="50"
      class="value"
      text-anchor="end"
    >
      ${escapeXml(impressions)}
    </text>

  </g>

</svg>`;

  return res.status(200).send(svg);
}
