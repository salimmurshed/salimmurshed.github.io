export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");

  const escapeXml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const userId = String(req.query.userId || "").trim();

  if (!userId) {
    return res.status(400).send(`
      <svg xmlns="http://www.w3.org/2000/svg" width="500" height="100">
        <text x="20" y="50" font-size="16" fill="red">
          Missing userId
        </text>
      </svg>
    `);
  }

  try {
    /*
     * DATA SOURCE
     *
     * Replace this URL with your own JSON API.
     */
    const DATA_URL = `https://salimmurshed.vercel.app/api/v1/linkedin-data?userId=${encodeURIComponent(userId)}`;

    const response = await fetch(DATA_URL);

    if (!response.ok) {
      throw new Error(`Data API failed: ${response.status}`);
    }

    const stats = await response.json();

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
  }

  .divider {
    stroke: #e5e7eb;
  }
</style>

<rect
  class="card"
  x="0.5"
  y="0.5"
  width="499"
  height="379"
  rx="10"
/>

<text x="25" y="42" class="title">
  Track performance
</text>

<text x="25" y="65" class="username">
  @${escapeXml(stats.username)}
</text>

<line
  x1="25"
  y1="85"
  x2="475"
  y2="85"
  class="divider"
/>


<!-- IMPRESSIONS -->

<text x="25" y="125" class="value">
  ${escapeXml(stats.impressions)}
</text>

<text x="25" y="150" class="label">
  Post impressions in 7 days
</text>


<line
  x1="25"
  y1="170"
  x2="475"
  y2="170"
  class="divider"
/>


<!-- FOLLOWERS -->

<text x="25" y="210" class="value">
  ${escapeXml(stats.followers)}
</text>

<text x="25" y="235" class="label">
  Total followers
</text>

<text x="25" y="258" class="growth">
  ${escapeXml(stats.followersGrowth)}
</text>

<text x="65" y="258" class="subLabel">
  vs. prior 7 days
</text>


<line
  x1="25"
  y1="278"
  x2="475"
  y2="278"
  class="divider"
/>


<!-- PROFILE VIEWERS -->

<text x="25" y="318" class="value">
  ${escapeXml(stats.profileViewers)}
</text>

<text x="25" y="342" class="label">
  Profile viewers in 90 days
</text>


<!-- DIVIDER -->

<line
  x1="250"
  y1="295"
  x2="250"
  y2="355"
  class="divider"
/>


<!-- SEARCH APPEARANCES -->

<text x="275" y="318" class="value">
  ${escapeXml(stats.searchAppearances)}
</text>

<text x="275" y="342" class="label">
  Search appearances
</text>

</svg>
`;

    return res.status(200).send(svg);
  } catch (error) {
    return res.status(500).send(`
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="500"
  height="100"
>
  <text
    x="20"
    y="50"
    font-family="Arial"
    font-size="14"
    fill="red"
  >
    ${escapeXml(error.message)}
  </text>
</svg>
    `);
  }
}
