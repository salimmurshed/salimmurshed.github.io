export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const escapeXml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  // Dynamic data from URL parameters
  const stats = {
    username: req.query.query || req.query.userId || "Unknown",

    impressions: req.query.impressions || "0",
    impressionsPeriod:
      req.query.impressionsPeriod || "Post impressions in 7 days",

    followers: req.query.followers || "0",
    followersLabel: req.query.followersLabel || "Total followers",
    followersGrowth: req.query.followersGrowth || "0%",
    followersGrowthLabel: req.query.followersGrowthLabel || "vs. prior 7 days",

    profileViewers: req.query.profileViewers || "0",
    profileViewersLabel:
      req.query.profileViewersLabel || "Profile viewers in 90 days",

    searchAppearances: req.query.searchAppearances || "0",
    searchAppearancesLabel:
      req.query.searchAppearancesLabel || "Search appearances",

    searchGrowth: req.query.searchGrowth || "0%",

    searchGrowthLabel: req.query.searchGrowthLabel || "vs. previous period",
  };

  const svg = `
<svg
  width="500"
  height="380"
  viewBox="0 0 500 380"
  xmlns="http://www.w3.org/2000/svg"
>

  <style>
    .title {
      font-family: Arial, sans-serif;
      font-size: 22px;
      font-weight: 700;
      fill: #191919;
    }

    .username {
      font-family: Arial, sans-serif;
      font-size: 13px;
      fill: #666;
    }

    .value {
      font-family: Arial, sans-serif;
      font-size: 28px;
      font-weight: 700;
      fill: #191919;
    }

    .label {
      font-family: Arial, sans-serif;
      font-size: 14px;
      fill: #191919;
    }

    .subLabel {
      font-family: Arial, sans-serif;
      font-size: 12px;
      fill: #666;
    }

    .growth {
      font-family: Arial, sans-serif;
      font-size: 13px;
      font-weight: 600;
      fill: #057642;
    }

    .card {
      fill: #ffffff;
      stroke: #d0d7de;
      stroke-width: 1;
    }

    .divider {
      stroke: #e5e7eb;
      stroke-width: 1;
    }
  </style>


  <!-- Main Card -->
  <rect
    class="card"
    x="0.5"
    y="0.5"
    width="499"
    height="379"
    rx="10"
  />


  <!-- Header -->

  <text x="25" y="42" class="title">
    Track performance
  </text>

  <text x="25" y="65" class="username">
    @${escapeXml(stats.username)}
  </text>


  <!-- Divider -->

  <line
    x1="25"
    y1="85"
    x2="475"
    y2="85"
    class="divider"
  />


  <!-- Post Impressions -->

  <text x="25" y="125" class="value">
    ${escapeXml(stats.impressions)}
  </text>

  <text x="25" y="150" class="label">
    ${escapeXml(stats.impressionsPeriod)}
  </text>


  <!-- Divider -->

  <line
    x1="25"
    y1="170"
    x2="475"
    y2="170"
    class="divider"
  />


  <!-- Followers -->

  <text x="25" y="210" class="value">
    ${escapeXml(stats.followers)}
  </text>

  <text x="25" y="235" class="label">
    ${escapeXml(stats.followersLabel)}
  </text>

  <text x="25" y="258" class="growth">
    ${escapeXml(stats.followersGrowth)}
  </text>

  <text x="65" y="258" class="subLabel">
    ${escapeXml(stats.followersGrowthLabel)}
  </text>


  <!-- Divider -->

  <line
    x1="25"
    y1="278"
    x2="475"
    y2="278"
    class="divider"
  />


  <!-- Bottom two columns -->


  <!-- Profile viewers -->

  <text x="25" y="318" class="value">
    ${escapeXml(stats.profileViewers)}
  </text>

  <text x="25" y="342" class="label">
    ${escapeXml(stats.profileViewersLabel)}
  </text>


  <!-- Vertical Divider -->

  <line
    x1="250"
    y1="295"
    x2="250"
    y2="355"
    class="divider"
  />


  <!-- Search appearances -->

  <text x="275" y="318" class="value">
    ${escapeXml(stats.searchAppearances)}
  </text>

  <text x="275" y="342" class="label">
    ${escapeXml(stats.searchAppearancesLabel)}
  </text>

</svg>
`;

  return res.status(200).send(svg);
}
