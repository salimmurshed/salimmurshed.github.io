export default async function handler(req, res) {
  const USER_ID = req.query.id || "9202118";
  const SITE = req.query.site || "stackoverflow";

  try {
    // =========================================================
    // HELPERS
    // =========================================================

    const escapeXml = (value) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

    const formatNumber = (value) =>
      new Intl.NumberFormat("en-US").format(Number(value || 0));

    const shortNumber = (value) => {
      value = Number(value || 0);

      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      }

      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }

      return String(value);
    };

    const api = async (url) => {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Stack Exchange API error ${response.status}: ${url}`);
      }

      return response.json();
    };

    // =========================================================
    // USER PROFILE
    // =========================================================

    const userData = await api(
      `https://api.stackexchange.com/2.3/users/${USER_ID}?site=${SITE}&filter=default`,
    );

    if (!userData.items || userData.items.length === 0) {
      throw new Error("Stack Overflow user not found");
    }

    const user = userData.items[0];

    // =========================================================
    // BASIC PROFILE DATA
    // =========================================================

    const name = user.display_name || "Stack Overflow User";

    const reputation = Number(user.reputation || 0);

    const profileImage = user.profile_image || "";

    const profileViews = Number(user.view_count || 0);

    const gold = Number(user.badge_counts?.gold || 0);

    const silver = Number(user.badge_counts?.silver || 0);

    const bronze = Number(user.badge_counts?.bronze || 0);

    // =========================================================
    // QUESTIONS
    // =========================================================

    const questionData = await api(
      `https://api.stackexchange.com/2.3/users/${USER_ID}/questions?site=${SITE}&pagesize=100&filter=default`,
    );

    const questions = Number(
      questionData.total || questionData.items?.length || 0,
    );

    // =========================================================
    // ANSWERS
    // =========================================================

    const answerData = await api(
      `https://api.stackexchange.com/2.3/users/${USER_ID}/answers?site=${SITE}&pagesize=100&filter=default`,
    );

    const answers = Number(answerData.total || answerData.items?.length || 0);

    // =========================================================
    // PEOPLE REACHED
    //
    // Approximation based on question + answer scores/views.
    // Stack Overflow does not expose the profile's exact
    // "people reached" number through the public API.
    // =========================================================

    let peopleReached = 0;

    const questionItems = questionData.items || [];

    for (const question of questionItems) {
      peopleReached += Number(question.view_count || 0);
    }

    /*
     * If you have more than 100 questions, request additional
     * pages so the approximation becomes more complete.
     */

    if (questionData.has_more) {
      const maxPages = Math.min(Number(questionData.quota_remaining || 0), 10);

      for (let page = 2; page <= maxPages; page++) {
        try {
          const pageData = await api(
            `https://api.stackexchange.com/2.3/users/${USER_ID}/questions?site=${SITE}&page=${page}&pagesize=100&filter=default`,
          );

          for (const question of pageData.items || []) {
            peopleReached += Number(question.view_count || 0);
          }

          if (!pageData.has_more) break;
        } catch {
          break;
        }
      }
    }

    // =========================================================
    // VOTES CAST
    //
    // Stack Exchange does not expose the exact profile
    // "votes cast" statistic as a simple user field.
    //
    // We therefore use the available vote counts when present.
    // =========================================================

    const upVotes = Number(user.up_vote_count || 0);

    const downVotes = Number(user.down_vote_count || 0);

    const votesCast = upVotes + downVotes;

    // =========================================================
    // POSTS EDITED
    //
    // Try to retrieve revisions made by the user.
    // =========================================================

    let postsEdited = 0;

    try {
      const revisionData = await api(
        `https://api.stackexchange.com/2.3/users/${USER_ID}/revisions?site=${SITE}&pagesize=100&filter=default`,
      );

      postsEdited = revisionData.total || revisionData.items?.length || 0;
    } catch {
      postsEdited = 0;
    }

    // =========================================================
    // HELPFUL FLAGS
    //
    // The public Stack Exchange API does not expose the exact
    // profile "helpful flags" count.
    //
    // Keep it unavailable instead of displaying a fake number.
    // =========================================================

    const helpfulFlags = null;

    // =========================================================
    // REPUTATION HISTORY
    // =========================================================

    const reputationData = await api(
      `https://api.stackexchange.com/2.3/users/${USER_ID}/reputation-history?site=${SITE}&pagesize=100`,
    );

    const history = reputationData.items || [];

    // =========================================================
    // RECENT REPUTATION
    // =========================================================

    const now = Math.floor(Date.now() / 1000);

    const DAY = 86400;

    const today = history
      .filter((item) => now - item.creation_date <= DAY)
      .reduce((sum, item) => sum + Number(item.reputation_change || 0), 0);

    const week = history
      .filter((item) => now - item.creation_date <= DAY * 7)
      .reduce((sum, item) => sum + Number(item.reputation_change || 0), 0);

    const month = history
      .filter((item) => now - item.creation_date <= DAY * 30)
      .reduce((sum, item) => sum + Number(item.reputation_change || 0), 0);

    // =========================================================
    // 30 DAY CHART
    // =========================================================

    const daily = {};

    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * DAY * 1000);

      const key = date.toISOString().slice(0, 10);

      daily[key] = 0;
    }

    for (const item of history) {
      const date = new Date(item.creation_date * 1000)
        .toISOString()
        .slice(0, 10);

      if (daily[date] !== undefined) {
        daily[date] += Number(item.reputation_change || 0);
      }
    }

    const chartValues = Object.values(daily);

    // =========================================================
    // CHART
    // =========================================================

    const chartX = 500;

    const chartY = 95;

    const chartWidth = 350;

    const chartHeight = 80;

    const minValue = Math.min(...chartValues, 0);

    const maxValue = Math.max(...chartValues, 1);

    const range = maxValue - minValue || 1;

    const points = chartValues
      .map((value, index) => {
        const x =
          chartX + (index / Math.max(chartValues.length - 1, 1)) * chartWidth;

        const y =
          chartY + chartHeight - ((value - minValue) / range) * chartHeight;

        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    // =========================================================
    // PEOPLE REACHED DISPLAY
    // =========================================================

    const peopleReachedDisplay =
      peopleReached > 0 ? `~${shortNumber(peopleReached)}` : "N/A";

    // =========================================================
    // HELPFUL FLAGS DISPLAY
    // =========================================================

    const helpfulFlagsDisplay =
      helpfulFlags === null ? "N/A" : formatNumber(helpfulFlags);

    // =========================================================
    // SVG
    // =========================================================

    const svg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="900"
  height="390"
  viewBox="0 0 900 390"
>

  <defs>

    <linearGradient
      id="background"
      x1="0"
      y1="0"
      x2="900"
      y2="390"
      gradientUnits="userSpaceOnUse"
    >
      <stop offset="0%" stop-color="#0D1117"/>
      <stop offset="100%" stop-color="#171B22"/>
    </linearGradient>

    <linearGradient
      id="orange"
      x1="0"
      y1="0"
      x2="900"
      y2="0"
    >
      <stop offset="0%" stop-color="#F48024"/>
      <stop offset="100%" stop-color="#FFB86B"/>
    </linearGradient>

    <clipPath id="avatarClip">
      <circle
        cx="70"
        cy="70"
        r="42"
      />
    </clipPath>

  </defs>


  <!-- ===================================================== -->
  <!-- BACKGROUND -->
  <!-- ===================================================== -->

  <rect
    width="900"
    height="390"
    rx="18"
    fill="url(#background)"
  />


  <!-- TOP BORDER -->

  <rect
    width="900"
    height="5"
    rx="3"
    fill="url(#orange)"
  />


  <!-- ===================================================== -->
  <!-- PROFILE IMAGE -->
  <!-- ===================================================== -->

  <circle
    cx="70"
    cy="70"
    r="46"
    fill="#252A33"
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


  <!-- ===================================================== -->
  <!-- NAME -->
  <!-- ===================================================== -->

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


  <!-- DIVIDER -->

  <line
    x1="30"
    y1="140"
    x2="870"
    y2="140"
    stroke="#30363D"
  />


  <!-- ===================================================== -->
  <!-- ROW 1 -->
  <!-- ===================================================== -->

  <text
    x="40"
    y="170"
    fill="#8B949E"
    font-family="Arial"
    font-size="11"
    font-weight="600"
  >
    QUESTIONS
  </text>

  <text
    x="40"
    y="200"
    fill="#FFFFFF"
    font-family="Arial"
    font-size="25"
    font-weight="700"
  >
    ${formatNumber(questions)}
  </text>


  <text
    x="170"
    y="170"
    fill="#8B949E"
    font-family="Arial"
    font-size="11"
    font-weight="600"
  >
    ANSWERS
  </text>

  <text
    x="170"
    y="200"
    fill="#FFFFFF"
    font-family="Arial"
    font-size="25"
    font-weight="700"
  >
    ${formatNumber(answers)}
  </text>


  <text
    x="300"
    y="170"
    fill="#8B949E"
    font-family="Arial"
    font-size="11"
    font-weight="600"
  >
    PROFILE VIEWS
  </text>

  <text
    x="300"
    y="200"
    fill="#FFFFFF"
    font-family="Arial"
    font-size="25"
    font-weight="700"
  >
    ${shortNumber(profileViews)}
  </text>


  <text
    x="450"
    y="170"
    fill="#8B949E"
    font-family="Arial"
    font-size="11"
    font-weight="600"
  >
    PEOPLE REACHED
  </text>

  <text
    x="450"
    y="200"
    fill="#FFFFFF"
    font-family="Arial"
    font-size="25"
    font-weight="700"
  >
    ${peopleReachedDisplay}
  </text>


  <!-- ===================================================== -->
  <!-- ROW 2 -->
  <!-- ===================================================== -->

  <text
    x="40"
    y="240"
    fill="#8B949E"
    font-family="Arial"
    font-size="11"
    font-weight="600"
  >
    BADGES
  </text>


  <circle
    cx="48"
    cy="264"
    r="6"
    fill="#FFCC00"
  />

  <text
    x="61"
    y="269"
    fill="#FFFFFF"
    font-family="Arial"
    font-size="13"
  >
    ${gold}
  </text>


  <circle
    cx="105"
    cy="264"
    r="6"
    fill="#B4B8BC"
  />

  <text
    x="118"
    y="269"
    fill="#FFFFFF"
    font-family="Arial"
    font-size="13"
  >
    ${silver}
  </text>


  <circle
    cx="162"
    cy="264"
    r="6"
    fill="#D28C45"
  />

  <text
    x="175"
    y="269"
    fill="#FFFFFF"
    font-family="Arial"
    font-size="13"
  >
    ${bronze}
  </text>


  <!-- POSTS EDITED -->

  <text
    x="250"
    y="240"
    fill="#8B949E"
    font-family="Arial"
    font-size="11"
    font-weight="600"
  >
    POSTS EDITED
  </text>

  <text
    x="250"
    y="270"
    fill="#FFFFFF"
    font-family="Arial"
    font-size="25"
    font-weight="700"
  >
    ${formatNumber(postsEdited)}
  </text>


  <!-- HELPFUL FLAGS -->

  <text
    x="390"
    y="240"
    fill="#8B949E"
    font-family="Arial"
    font-size="11"
    font-weight="600"
  >
    HELPFUL FLAGS
  </text>

  <text
    x="390"
    y="270"
    fill="#FFFFFF"
    font-family="Arial"
    font-size="25"
    font-weight="700"
  >
    ${helpfulFlagsDisplay}
  </text>


  <!-- VOTES CAST -->

  <text
    x="530"
    y="240"
    fill="#8B949E"
    font-family="Arial"
    font-size="11"
    font-weight="600"
  >
    VOTES CAST
  </text>

  <text
    x="530"
    y="270"
    fill="#FFFFFF"
    font-family="Arial"
    font-size="25"
    font-weight="700"
  >
    ${formatNumber(votesCast)}
  </text>


  <!-- ===================================================== -->
  <!-- CHART -->
  <!-- ===================================================== -->

  <text
    x="500"
    y="80"
    fill="#8B949E"
    font-family="Arial"
    font-size="11"
    font-weight="600"
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


  <line
    x1="${chartX}"
    y1="${chartY + chartHeight}"
    x2="${chartX + chartWidth}"
    y2="${chartY + chartHeight}"
    stroke="#30363D"
  />


  <!-- ===================================================== -->
  <!-- RECENT REPUTATION -->
  <!-- ===================================================== -->

  <text
    x="40"
    y="320"
    fill="#8B949E"
    font-family="Arial"
    font-size="11"
    font-weight="600"
  >
    RECENT REPUTATION
  </text>


  <text
    x="40"
    y="345"
    fill="${today >= 0 ? "#3FB950" : "#F85149"}"
    font-family="Arial"
    font-size="13"
    font-weight="700"
  >
    Today ${today >= 0 ? "+" : ""}${today}
  </text>


  <text
    x="130"
    y="345"
    fill="${week >= 0 ? "#3FB950" : "#F85149"}"
    font-family="Arial"
    font-size="13"
    font-weight="700"
  >
    7d ${week >= 0 ? "+" : ""}${week}
  </text>


  <text
    x="195"
    y="345"
    fill="${month >= 0 ? "#3FB950" : "#F85149"}"
    font-family="Arial"
    font-size="13"
    font-weight="700"
  >
    30d ${month >= 0 ? "+" : ""}${month}
  </text>


  <!-- ===================================================== -->
  <!-- FOOTER -->
  <!-- ===================================================== -->

  <text
    x="500"
    y="345"
    fill="#6E7681"
    font-family="Arial"
    font-size="10"
  >
    Stack Exchange API • Automatically updated
  </text>

</svg>
`;

    // =========================================================
    // RESPONSE
    // =========================================================

    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");

    res.setHeader("Cache-Control", "public, max-age=1800, s-maxage=1800");

    return res.status(200).send(svg);
  } catch (error) {
    console.error(error);

    const errorSvg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="900"
  height="200"
>

  <rect
    width="900"
    height="200"
    rx="18"
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
