export default async function handler(req, res) {
  const USER_ID = req.query.id || "";
  const SITE = req.query.site || "stackoverflow";

  try {
    const response = await fetch(
      `https://api.stackexchange.com/2.3/users/${USER_ID}?site=stackoverflow`,
    );

    if (!response.ok) {
      throw new Error(`Stack Overflow API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.items?.length) {
      throw new Error("User not found");
    }

    const user = data.items[0];

    // -----------------------------------------
    // Safe values
    // -----------------------------------------

    const name = user.display_name || "Stack Overflow User";

    const reputation = Number(user.reputation || 0);

    const questions = Number(user.question_count || 0);

    const answers = Number(user.answer_count || 0);

    const views = Number(user.view_count || 0);

    const gold = Number(user.badge_counts?.gold || 0);

    const silver = Number(user.badge_counts?.silver || 0);

    const bronze = Number(user.badge_counts?.bronze || 0);

    // -----------------------------------------
    // Format numbers
    // -----------------------------------------

    const formatNumber = (value) => {
      return new Intl.NumberFormat("en-US").format(value);
    };

    const formatViews = (value) => {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      }

      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }

      return formatNumber(value);
    };

    // -----------------------------------------
    // Escape XML
    // -----------------------------------------

    const escapeXml = (value) => {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    // -----------------------------------------
    // Profile image
    //
    // IMPORTANT:
    // GitHub can have problems rendering an
    // external image inside SVG.
    //
    // Stack Overflow profile image is placed
    // directly as an SVG image.
    // -----------------------------------------

    const profileImage = user.profile_image || "";

    // -----------------------------------------
    // SVG
    // -----------------------------------------

    const svg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="900"
  height="300"
  viewBox="0 0 900 300"
>

  <defs>

    <linearGradient
      id="bg"
      x1="0"
      y1="0"
      x2="900"
      y2="300"
      gradientUnits="userSpaceOnUse"
    >
      <stop offset="0%" stop-color="#101418"/>
      <stop offset="100%" stop-color="#1b2026"/>
    </linearGradient>

    <linearGradient
      id="orange"
      x1="0"
      y1="0"
      x2="900"
      y2="0"
    >
      <stop offset="0%" stop-color="#F48024"/>
      <stop offset="100%" stop-color="#FFB870"/>
    </linearGradient>

    <clipPath id="avatarClip">
      <circle
        cx="70"
        cy="70"
        r="42"
      />
    </clipPath>

  </defs>


  <!-- ============================= -->
  <!-- Background -->
  <!-- ============================= -->

  <rect
    width="900"
    height="300"
    rx="18"
    fill="url(#bg)"
  />


  <!-- ============================= -->
  <!-- Top orange line -->
  <!-- ============================= -->

  <rect
    width="900"
    height="5"
    rx="3"
    fill="url(#orange)"
  />


  <!-- ============================= -->
  <!-- Avatar background -->
  <!-- ============================= -->

  <circle
    cx="70"
    cy="70"
    r="45"
    fill="#252B32"
  />

  ${
    profileImage
      ? `
  <image
    href="${escapeXml(profileImage)}"
    x="28"
    y="28"
    width="84"
    height="84"
    preserveAspectRatio="xMidYMid slice"
    clip-path="url(#avatarClip)"
  />
  `
      : ""
  }


  <!-- ============================= -->
  <!-- Name -->
  <!-- ============================= -->

  <text
    x="135"
    y="62"
    fill="#FFFFFF"
    font-family="Arial, Helvetica, sans-serif"
    font-size="25"
    font-weight="700"
  >
    ${escapeXml(name)}
  </text>


  <!-- ============================= -->
  <!-- Stack Overflow -->
  <!-- ============================= -->

  <text
    x="135"
    y="88"
    fill="#F48024"
    font-family="Arial, Helvetica, sans-serif"
    font-size="13"
    font-weight="700"
    letter-spacing="1"
  >
    STACK OVERFLOW
  </text>


  <!-- ============================= -->
  <!-- Reputation -->
  <!-- ============================= -->

  <text
    x="135"
    y="113"
    fill="#8B949E"
    font-family="Arial, Helvetica, sans-serif"
    font-size="12"
  >
    REPUTATION
  </text>

  <text
    x="215"
    y="113"
    fill="#FFFFFF"
    font-family="Arial, Helvetica, sans-serif"
    font-size="14"
    font-weight="700"
  >
    ${formatNumber(reputation)}
  </text>


  <!-- ============================= -->
  <!-- Divider -->
  <!-- ============================= -->

  <line
    x1="30"
    y1="140"
    x2="870"
    y2="140"
    stroke="#30363D"
  />


  <!-- ============================= -->
  <!-- QUESTION -->
  <!-- ============================= -->

  <text
    x="40"
    y="170"
    fill="#8B949E"
    font-family="Arial, Helvetica, sans-serif"
    font-size="11"
    font-weight="600"
  >
    QUESTIONS
  </text>

  <text
    x="40"
    y="200"
    fill="#FFFFFF"
    font-family="Arial, Helvetica, sans-serif"
    font-size="25"
    font-weight="700"
  >
    ${formatNumber(questions)}
  </text>


  <!-- ============================= -->
  <!-- ANSWERS -->
  <!-- ============================= -->

  <text
    x="175"
    y="170"
    fill="#8B949E"
    font-family="Arial, Helvetica, sans-serif"
    font-size="11"
    font-weight="600"
  >
    ANSWERS
  </text>

  <text
    x="175"
    y="200"
    fill="#FFFFFF"
    font-family="Arial, Helvetica, sans-serif"
    font-size="25"
    font-weight="700"
  >
    ${formatNumber(answers)}
  </text>


  <!-- ============================= -->
  <!-- PROFILE VIEWS -->
  <!-- ============================= -->

  <text
    x="310"
    y="170"
    fill="#8B949E"
    font-family="Arial, Helvetica, sans-serif"
    font-size="11"
    font-weight="600"
  >
    PROFILE VIEWS
  </text>

  <text
    x="310"
    y="200"
    fill="#FFFFFF"
    font-family="Arial, Helvetica, sans-serif"
    font-size="25"
    font-weight="700"
  >
    ${formatViews(views)}
  </text>


  <!-- ============================= -->
  <!-- BADGES -->
  <!-- ============================= -->

  <text
    x="470"
    y="170"
    fill="#8B949E"
    font-family="Arial, Helvetica, sans-serif"
    font-size="11"
    font-weight="600"
  >
    BADGES
  </text>


  <!-- Gold -->

  <circle
    cx="480"
    cy="194"
    r="6"
    fill="#FFCC00"
  />

  <text
    x="494"
    y="199"
    fill="#FFFFFF"
    font-family="Arial, Helvetica, sans-serif"
    font-size="13"
  >
    ${gold}
  </text>


  <!-- Silver -->

  <circle
    cx="535"
    cy="194"
    r="6"
    fill="#B4B8BC"
  />

  <text
    x="549"
    y="199"
    fill="#FFFFFF"
    font-family="Arial, Helvetica, sans-serif"
    font-size="13"
  >
    ${silver}
  </text>


  <!-- Bronze -->

  <circle
    cx="590"
    cy="194"
    r="6"
    fill="#D28C45"
  />

  <text
    x="604"
    y="199"
    fill="#FFFFFF"
    font-family="Arial, Helvetica, sans-serif"
    font-size="13"
  >
    ${bronze}
  </text>


  <!-- ============================= -->
  <!-- Profile link -->
  <!-- ============================= -->

  <text
    x="40"
    y="250"
    fill="#6E7681"
    font-family="Arial, Helvetica, sans-serif"
    font-size="11"
  >
    stackoverflow.com/users/${USER_ID}
  </text>


  <!-- ============================= -->
  <!-- Live indicator -->
  <!-- ============================= -->

  <circle
    cx="850"
    cy="250"
    r="5"
    fill="#3FB950"
  />

  <text
    x="765"
    y="255"
    fill="#6E7681"
    font-family="Arial, Helvetica, sans-serif"
    font-size="10"
  >
    LIVE DATA
  </text>

</svg>
`;

    // -----------------------------------------
    // Response headers
    // -----------------------------------------

    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");

    res.setHeader("Cache-Control", "public, max-age=1800, s-maxage=1800");

    return res.status(200).send(svg);
  } catch (error) {
    console.error(error);

    const errorSvg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="900"
  height="180"
>
  <rect
    width="900"
    height="180"
    rx="18"
    fill="#101418"
  />

  <text
    x="450"
    y="80"
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
    y="115"
    text-anchor="middle"
    fill="#8B949E"
    font-family="Arial"
    font-size="12"
  >
    ${escapeXml(error.message)}
  </text>
</svg>
`;

    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");

    return res.status(500).send(errorSvg);
  }
}
