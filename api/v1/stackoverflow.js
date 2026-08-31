export default async function handler(req, res) {
  const USER_ID = "9202118";
  const SITE = "stackoverflow";

  try {
    // --------------------------------------------------
    // Fetch Stack Overflow profile
    // --------------------------------------------------

    const userResponse = await fetch(
      `https://api.stackexchange.com/2.3/users/${USER_ID}?site=${SITE}`,
    );

    if (!userResponse.ok) {
      throw new Error("Failed to fetch Stack Overflow user");
    }

    const userData = await userResponse.json();

    if (!userData.items || userData.items.length === 0) {
      throw new Error("Stack Overflow user not found");
    }

    const user = userData.items[0];

    // --------------------------------------------------
    // Fetch reputation history
    // --------------------------------------------------

    const reputationResponse = await fetch(
      `https://api.stackexchange.com/2.3/users/${USER_ID}/reputation-history?site=${SITE}&pagesize=100`,
    );

    const reputationData = await reputationResponse.json();

    const history = reputationData.items || [];

    // --------------------------------------------------
    // Helper functions
    // --------------------------------------------------

    const escapeXml = (value) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

    const formatNumber = (number) =>
      new Intl.NumberFormat("en-US").format(number || 0);

    const shortNumber = (number) => {
      number = Number(number || 0);

      if (number >= 1000000) {
        return (number / 1000000).toFixed(1) + "M";
      }

      if (number >= 1000) {
        return (number / 1000).toFixed(1) + "K";
      }

      return String(number);
    };

    const now = Math.floor(Date.now() / 1000);

    const day = 60 * 60 * 24;

    // --------------------------------------------------
    // Calculate reputation changes
    // --------------------------------------------------

    const today = history
      .filter((item) => now - item.creation_date <= day)
      .reduce((sum, item) => sum + item.reputation_change, 0);

    const week = history
      .filter((item) => now - item.creation_date <= day * 7)
      .reduce((sum, item) => sum + item.reputation_change, 0);

    const month = history
      .filter((item) => now - item.creation_date <= day * 30)
      .reduce((sum, item) => sum + item.reputation_change, 0);

    // --------------------------------------------------
    // Build last 30 day reputation data
    // --------------------------------------------------

    const daily = {};

    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);

      const key = date.toISOString().slice(0, 10);

      daily[key] = 0;
    }

    history.forEach((item) => {
      const date = new Date(item.creation_date * 1000)
        .toISOString()
        .slice(0, 10);

      if (daily[date] !== undefined) {
        daily[date] += item.reputation_change;
      }
    });

    const chartValues = Object.values(daily);

    // --------------------------------------------------
    // Create chart
    // --------------------------------------------------

    const chartX = 455;
    const chartY = 116;
    const chartWidth = 330;
    const chartHeight = 80;

    const minValue = Math.min(...chartValues, 0);
    const maxValue = Math.max(...chartValues, 1);

    const range = maxValue - minValue || 1;

    const points = chartValues
      .map((value, index) => {
        const x = chartX + (index / (chartValues.length - 1)) * chartWidth;

        const y =
          chartY + chartHeight - ((value - minValue) / range) * chartHeight;

        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    // --------------------------------------------------
    // Badge counts
    // --------------------------------------------------

    const gold = user.badge_counts?.gold || 0;
    const silver = user.badge_counts?.silver || 0;
    const bronze = user.badge_counts?.bronze || 0;

    // --------------------------------------------------
    // Profile image
    // --------------------------------------------------

    const profileImage = user.profile_image || "";

    // --------------------------------------------------
    // SVG
    // --------------------------------------------------

    const svg = `
<svg
  width="900"
  height="330"
  viewBox="0 0 900 330"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>

  <defs>

    <linearGradient
      id="background"
      x1="0"
      y1="0"
      x2="900"
      y2="330"
      gradientUnits="userSpaceOnUse"
    >
      <stop stop-color="#0D1117"/>
      <stop offset="1" stop-color="#171B22"/>
    </linearGradient>

    <linearGradient
      id="accent"
      x1="0"
      y1="0"
      x2="900"
      y2="0"
      gradientUnits="userSpaceOnUse"
    >
      <stop stop-color="#F48024"/>
      <stop offset="1" stop-color="#FFB86B"/>
    </linearGradient>

    <clipPath id="avatar">
      <circle cx="74" cy="75" r="45"/>
    </clipPath>

    <filter
      id="shadow"
      x="-20%"
      y="-20%"
      width="140%"
      height="140%"
    >
      <feDropShadow
        dx="0"
        dy="8"
        stdDeviation="12"
        flood-opacity="0.35"
      />
    </filter>

  </defs>

  <!-- Background -->

  <rect
    width="900"
    height="330"
    rx="18"
    fill="url(#background)"
  />

  <!-- Orange top border -->

  <rect
    x="0"
    y="0"
    width="900"
    height="5"
    rx="3"
    fill="url(#accent)"
  />

  <!-- Avatar -->

  <circle
    cx="74"
    cy="75"
    r="48"
    fill="#252A33"
  />

  ${
    profileImage
      ? `
  <image
    href="${escapeXml(profileImage)}"
    x="29"
    y="30"
    width="90"
    height="90"
    clip-path="url(#avatar)"
    preserveAspectRatio="xMidYMid slice"
  />
  `
      : ""
  }

  <!-- Name -->

  <text
    x="145"
    y="65"
    fill="#FFFFFF"
    font-family="Arial, Helvetica, sans-serif"
    font-size="26"
    font-weight="700"
  >
    ${escapeXml(user.display_name)}
  </text>

  <!-- Stack Overflow -->

  <text
    x="145"
    y="92"
    fill="#F48024"
    font-family="Arial, Helvetica, sans-serif"
    font-size="15"
    font-weight="600"
  >
    STACK OVERFLOW
  </text>

  <!-- Reputation -->

  <text
    x="145"
    y="116"
    fill="#9DA7B3"
    font-family="Arial, Helvetica, sans-serif"
    font-size="13"
  >
    Reputation
  </text>

  <text
    x="215"
    y="116"
    fill="#FFFFFF"
    font-family="Arial, Helvetica, sans-serif"
    font-size="13"
    font-weight="700"
  >
    ${formatNumber(user.reputation)}
  </text>

  <!-- Divider -->

  <line
    x1="35"
    y1="145"
    x2="865"
    y2="145"
    stroke="#30363D"
  />

  <!-- Stats -->

  <g font-family="Arial, Helvetica, sans-serif">

    <!-- Questions -->

    <text
      x="45"
      y="180"
      fill="#8B949E"
      font-size="12"
    >
      QUESTIONS
    </text>

    <text
      x="45"
      y="207"
      fill="#FFFFFF"
      font-size="24"
      font-weight="700"
    >
      ${formatNumber(user.question_count)}
    </text>

    <!-- Answers -->

    <text
      x="160"
      y="180"
      fill="#8B949E"
      font-size="12"
    >
      ANSWERS
    </text>

    <text
      x="160"
      y="207"
      fill="#FFFFFF"
      font-size="24"
      font-weight="700"
    >
      ${formatNumber(user.answer_count)}
    </text>

    <!-- Views -->

    <text
      x="275"
      y="180"
      fill="#8B949E"
      font-size="12"
    >
      PROFILE VIEWS
    </text>

    <text
      x="275"
      y="207"
      fill="#FFFFFF"
      font-size="24"
      font-weight="700"
    >
      ${shortNumber(user.view_count)}
    </text>

    <!-- Badges -->

    <text
      x="45"
      y="245"
      fill="#8B949E"
      font-size="12"
    >
      BADGES
    </text>

    <circle cx="52" cy="265" r="6" fill="#FFCC00"/>

    <text
      x="65"
      y="270"
      fill="#FFFFFF"
      font-size="13"
    >
      ${gold}
    </text>

    <circle cx="105" cy="265" r="6" fill="#B4B8BC"/>

    <text
      x="118"
      y="270"
      fill="#FFFFFF"
      font-size="13"
    >
      ${silver}
    </text>

    <circle cx="158" cy="265" r="6" fill="#D28C45"/>

    <text
      x="171"
      y="270"
      fill="#FFFFFF"
      font-size="13"
    >
      ${bronze}
    </text>

    <!-- Reputation changes -->

    <text
      x="275"
      y="245"
      fill="#8B949E"
      font-size="12"
    >
      RECENT REPUTATION
    </text>

    <text
      x="275"
      y="270"
      fill="${today >= 0 ? "#3FB950" : "#F85149"}"
      font-size="13"
      font-weight="700"
    >
      Today ${today >= 0 ? "+" : ""}${today}
    </text>

    <text
      x="360"
      y="270"
      fill="${week >= 0 ? "#3FB950" : "#F85149"}"
      font-size="13"
      font-weight="700"
    >
      7d ${week >= 0 ? "+" : ""}${week}
    </text>

    <text
      x="425"
      y="270"
      fill="${month >= 0 ? "#3FB950" : "#F85149"}"
      font-size="13"
      font-weight="700"
    >
      30d ${month >= 0 ? "+" : ""}${month}
    </text>

  </g>

  <!-- Chart -->

  <text
    x="455"
    y="95"
    fill="#8B949E"
    font-family="Arial, Helvetica, sans-serif"
    font-size="12"
  >
    30 DAY REPUTATION ACTIVITY
  </text>

  <polyline
    points="${points}"
    fill="none"
    stroke="#F48024"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  <!-- Chart baseline -->

  <line
    x1="${chartX}"
    y1="${chartY + chartHeight}"
    x2="${chartX + chartWidth}"
    y2="${chartY + chartHeight}"
    stroke="#30363D"
  />

  <!-- Footer -->

  <text
    x="455"
    y="270"
    fill="#6E7681"
    font-family="Arial, Helvetica, sans-serif"
    font-size="11"
  >
    Updated automatically from Stack Exchange API
  </text>

</svg>
`;

    // --------------------------------------------------
    // Return SVG
    // --------------------------------------------------

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");

    return res.status(200).send(svg);
  } catch (error) {
    console.error(error);

    const errorSvg = `
<svg
  width="900"
  height="200"
  xmlns="http://www.w3.org/2000/svg"
>
  <rect
    width="900"
    height="200"
    rx="16"
    fill="#0D1117"
  />

  <text
    x="450"
    y="90"
    text-anchor="middle"
    fill="#F85149"
    font-family="Arial"
    font-size="20"
    font-weight="700"
  >
    Stack Overflow statistics unavailable
  </text>

  <text
    x="450"
    y="125"
    text-anchor="middle"
    fill="#8B949E"
    font-family="Arial"
    font-size="13"
  >
    Please try again later
  </text>
</svg>
`;

    res.setHeader("Content-Type", "image/svg+xml");

    return res.status(500).send(errorSvg);
  }
}
