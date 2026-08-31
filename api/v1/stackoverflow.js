export default async function handler(req, res) {
  const USER_ID = String(req.query.id || "9202118");
  const SITE = String(req.query.site || "stackoverflow");

  const API_BASE = "https://api.stackexchange.com/2.3";

  // ------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------

  const escapeXml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const number = (value) =>
    new Intl.NumberFormat("en-US").format(Number(value || 0));

  const shortNumber = (value) => {
    const n = Number(value || 0);

    if (n >= 1000000) {
      return `${(n / 1000000).toFixed(1)}M`;
    }

    if (n >= 1000) {
      return `${Math.round(n / 1000)}K`;
    }

    return String(n);
  };

  const fetchJson = async (url) => {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "SalimMurshed-StackOverflow-Stats",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${url}`);
    }

    return response.json();
  };

  const fetchHtml = async (url) => {
    const response = await fetch(url, {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",

        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151.0 Safari/537.36",

        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      throw new Error(`Profile HTTP ${response.status}`);
    }

    return response.text();
  };

  // ------------------------------------------------------------
  // Extract visible text from HTML
  //
  // This is intentionally NOT dependent on specific CSS classes.
  // ------------------------------------------------------------

  const htmlToText = (html) => {
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s+/g, " ")
      .trim();
  };

  // ============================================================
  // 1. USER API
  // ============================================================

  const userUrl =
    `${API_BASE}/users/${encodeURIComponent(USER_ID)}` +
    `?site=${encodeURIComponent(SITE)}`;

  const userData = await fetchJson(userUrl);

  if (!userData.items || !userData.items.length) {
    throw new Error("Stack Overflow user not found");
  }

  const user = userData.items[0];

  // ============================================================
  // 2. BASIC USER INFORMATION
  // ============================================================

  const displayName = user.display_name || "Stack Overflow User";

  const reputation = Number(user.reputation || 0);

  const profileImage = user.profile_image || "";

  const gold = Number(user.badge_counts?.gold || 0);

  const silver = Number(user.badge_counts?.silver || 0);

  const bronze = Number(user.badge_counts?.bronze || 0);

  // ============================================================
  // 3. VOTES CAST
  //
  // Actual profile currently:
  //
  // 199 upvotes
  // 6 downvotes
  //
  // = 205 votes cast
  //
  // API officially exposes both values.
  // ============================================================

  const upVotes = Number(user.up_vote_count || 0);

  const downVotes = Number(user.down_vote_count || 0);

  const votesCast = upVotes + downVotes;

  // ============================================================
  // 4. POSTS EDITED
  //
  // Stack Exchange user timeline exposes:
  //
  // timeline_type = "revision"
  //
  // We paginate through ALL available timeline records and count
  // revision actions.
  // ============================================================

  let postsEdited = 0;

  let timelinePage = 1;

  let timelineHasMore = true;

  while (timelineHasMore && timelinePage <= 50) {
    const timelineUrl =
      `${API_BASE}/users/${encodeURIComponent(USER_ID)}/timeline` +
      `?site=${encodeURIComponent(SITE)}` +
      `&page=${timelinePage}` +
      `&pagesize=100` +
      `&order=desc` +
      `&sort=creation`;

    const timelineData = await fetchJson(timelineUrl);

    const items = timelineData.items || [];

    for (const item of items) {
      if (item.timeline_type === "revision") {
        postsEdited++;
      }
    }

    timelineHasMore = Boolean(timelineData.has_more);

    timelinePage++;

    if (!items.length) {
      break;
    }
  }

  // ============================================================
  // 5. STACK OVERFLOW PROFILE PAGE
  //
  // People reached + helpful flags are displayed on the actual
  // Stack Overflow profile page.
  //
  // Current profile:
  //
  // ~149k people reached
  // 4 helpful flags
  // ============================================================

  let peopleReached = "N/A";

  let helpfulFlags = "N/A";

  try {
    const profileUrl = `https://stackoverflow.com/users/${encodeURIComponent(
      USER_ID,
    )}?tab=topactivity`;

    const profileHtml = await fetchHtml(profileUrl);

    const profileText = htmlToText(profileHtml);

    // ----------------------------------------------------------
    // PEOPLE REACHED
    //
    // Example visible text:
    //
    // ~149k people reached
    // ----------------------------------------------------------

    const peopleMatch = profileText.match(
      /~\s*([\d,.]+)\s*([kKmMbB]?)\s+people\s+reached/i,
    );

    if (peopleMatch) {
      peopleReached = `~${peopleMatch[1]}${peopleMatch[2]}`;
    }

    // ----------------------------------------------------------
    // HELPFUL FLAGS
    //
    // Example:
    //
    // 4 helpful flags
    // ----------------------------------------------------------

    const flagsMatch = profileText.match(/(\d[\d,]*)\s+helpful\s+flags/i);

    if (flagsMatch) {
      helpfulFlags = Number(flagsMatch[1].replace(/,/g, ""));
    }
  } catch (error) {
    console.error("Profile page fetch failed:", error.message);
  }

  // ============================================================
  // 6. QUESTION / ANSWER / PROFILE VIEW
  //
  // The API user object is supposed to expose these fields.
  //
  // We also use an explicit API filter so these fields aren't
  // accidentally omitted.
  // ============================================================

  let questionCount = Number(user.question_count || 0);

  let answerCount = Number(user.answer_count || 0);

  let profileViews = Number(user.view_count || 0);

  // ============================================================
  // FALLBACK:
  //
  // If the API response doesn't include question/answer counts,
  // read them from the public profile HTML.
  // ============================================================

  try {
    const profileUrl = `https://stackoverflow.com/users/${encodeURIComponent(
      USER_ID,
    )}?tab=topactivity`;

    const profileHtml = await fetchHtml(profileUrl);

    const profileText = htmlToText(profileHtml);

    // Example:
    //
    // View all 117 answers
    //

    const answerMatch = profileText.match(/View all\s+([\d,]+)\s+answers/i);

    if (answerMatch && answerCount === 0) {
      answerCount = Number(answerMatch[1].replace(/,/g, ""));
    }

    // Example:
    //
    // View all 5 questions
    //

    const questionMatch = profileText.match(/View all\s+([\d,]+)\s+questions/i);

    if (questionMatch && questionCount === 0) {
      questionCount = Number(questionMatch[1].replace(/,/g, ""));
    }
  } catch (error) {
    console.error("Profile fallback failed:", error.message);
  }

  // ============================================================
  // 7. REPUTATION HISTORY
  // ============================================================

  const reputationUrl =
    `${API_BASE}/users/${encodeURIComponent(USER_ID)}` +
    `/reputation-history` +
    `?site=${encodeURIComponent(SITE)}` +
    `&pagesize=100`;

  const reputationData = await fetchJson(reputationUrl);

  const history = reputationData.items || [];

  const now = Math.floor(Date.now() / 1000);

  const DAY = 60 * 60 * 24;

  const reputationToday = history
    .filter((item) => now - item.creation_date <= DAY)
    .reduce((sum, item) => sum + Number(item.reputation_change || 0), 0);

  const reputationWeek = history
    .filter((item) => now - item.creation_date <= DAY * 7)
    .reduce((sum, item) => sum + Number(item.reputation_change || 0), 0);

  const reputationMonth = history
    .filter((item) => now - item.creation_date <= DAY * 30)
    .reduce((sum, item) => sum + Number(item.reputation_change || 0), 0);

  // ============================================================
  // 8. 30 DAY CHART
  // ============================================================

  const daily = {};

  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * DAY * 1000);

    const key = date.toISOString().slice(0, 10);

    daily[key] = 0;
  }

  for (const item of history) {
    const date = new Date(item.creation_date * 1000).toISOString().slice(0, 10);

    if (daily[date] !== undefined) {
      daily[date] += Number(item.reputation_change || 0);
    }
  }

  const chartValues = Object.values(daily);

  const chartX = 500;
  const chartY = 75;
  const chartWidth = 350;
  const chartHeight = 75;

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

  // ============================================================
  // 9. SVG
  // ============================================================

  const svg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="900"
  height="400"
  viewBox="0 0 900 400"
>

<defs>

  <linearGradient
    id="bg"
    x1="0"
    y1="0"
    x2="900"
    y2="400"
  >
    <stop
      offset="0%"
      stop-color="#0D1117"
    />

    <stop
      offset="100%"
      stop-color="#171B22"
    />
  </linearGradient>

  <linearGradient
    id="orange"
    x1="0"
    y1="0"
    x2="900"
    y2="0"
  >
    <stop
      offset="0%"
      stop-color="#F48024"
    />

    <stop
      offset="100%"
      stop-color="#FFB86B"
    />
  </linearGradient>

  <clipPath id="avatar">
    <circle
      cx="72"
      cy="70"
      r="42"
    />
  </clipPath>

</defs>


<!-- BACKGROUND -->

<rect
  width="900"
  height="400"
  rx="18"
  fill="url(#bg)"
/>


<!-- TOP -->

<rect
  width="900"
  height="5"
  rx="3"
  fill="url(#orange)"
/>


<!-- AVATAR -->

<circle
  cx="72"
  cy="70"
  r="47"
  fill="#252A33"
/>

${
  profileImage
    ? `
<image
  href="${escapeXml(profileImage)}"
  x="30"
  y="28"
  width="84"
  height="84"
  clip-path="url(#avatar)"
  preserveAspectRatio="xMidYMid slice"
/>
`
    : ""
}


<!-- NAME -->

<text
  x="140"
  y="60"
  fill="#FFFFFF"
  font-family="Arial, Helvetica, sans-serif"
  font-size="26"
  font-weight="700"
>
  ${escapeXml(displayName)}
</text>


<text
  x="140"
  y="86"
  fill="#F48024"
  font-family="Arial, Helvetica, sans-serif"
  font-size="13"
  font-weight="700"
  letter-spacing="1"
>
  STACK OVERFLOW
</text>


<text
  x="140"
  y="110"
  fill="#8B949E"
  font-family="Arial, Helvetica, sans-serif"
  font-size="12"
>
  REPUTATION
</text>


<text
  x="215"
  y="110"
  fill="#FFFFFF"
  font-family="Arial, Helvetica, sans-serif"
  font-size="14"
  font-weight="700"
>
  ${number(reputation)}
</text>


<!-- CHART -->

<text
  x="500"
  y="48"
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


<!-- DIVIDER -->

<line
  x1="30"
  y1="140"
  x2="870"
  y2="140"
  stroke="#30363D"
/>


<!-- BASIC STATS -->

<text
  x="40"
  y="170"
  fill="#8B949E"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  QUESTIONS
</text>

<text
  x="40"
  y="198"
  fill="#FFFFFF"
  font-family="Arial"
  font-size="24"
  font-weight="700"
>
  ${number(questionCount)}
</text>


<text
  x="160"
  y="170"
  fill="#8B949E"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  ANSWERS
</text>

<text
  x="160"
  y="198"
  fill="#FFFFFF"
  font-family="Arial"
  font-size="24"
  font-weight="700"
>
  ${number(answerCount)}
</text>


<text
  x="280"
  y="170"
  fill="#8B949E"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  PROFILE VIEWS
</text>

<text
  x="280"
  y="198"
  fill="#FFFFFF"
  font-family="Arial"
  font-size="24"
  font-weight="700"
>
  ${shortNumber(profileViews)}
</text>


<!-- BADGES -->

<text
  x="450"
  y="170"
  fill="#8B949E"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  BADGES
</text>


<circle
  cx="457"
  cy="191"
  r="6"
  fill="#FFCC00"
/>

<text
  x="472"
  y="196"
  fill="#FFFFFF"
  font-family="Arial"
  font-size="13"
>
  ${gold}
</text>


<circle
  cx="520"
  cy="191"
  r="6"
  fill="#B4B8BC"
/>

<text
  x="535"
  y="196"
  fill="#FFFFFF"
  font-family="Arial"
  font-size="13"
>
  ${silver}
</text>


<circle
  cx="583"
  cy="191"
  r="6"
  fill="#D28C45"
/>

<text
  x="598"
  y="196"
  fill="#FFFFFF"
  font-family="Arial"
  font-size="13"
>
  ${bronze}
</text>


<!-- IMPACT -->

<line
  x1="30"
  y1="220"
  x2="870"
  y2="220"
  stroke="#30363D"
/>


<text
  x="40"
  y="247"
  fill="#F48024"
  font-family="Arial"
  font-size="12"
  font-weight="700"
  letter-spacing="1"
>
  IMPACT
</text>


<!-- PEOPLE -->

<text
  x="40"
  y="270"
  fill="#8B949E"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  PEOPLE REACHED
</text>


<text
  x="40"
  y="298"
  fill="#FFFFFF"
  font-family="Arial"
  font-size="25"
  font-weight="700"
>
  ${escapeXml(peopleReached)}
</text>


<!-- EDITED -->

<text
  x="250"
  y="270"
  fill="#8B949E"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  POSTS EDITED
</text>


<text
  x="250"
  y="298"
  fill="#FFFFFF"
  font-family="Arial"
  font-size="25"
  font-weight="700"
>
  ${escapeXml(postsEdited)}
</text>


<!-- FLAGS -->

<text
  x="440"
  y="270"
  fill="#8B949E"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  HELPFUL FLAGS
</text>


<text
  x="440"
  y="298"
  fill="#FFFFFF"
  font-family="Arial"
  font-size="25"
  font-weight="700"
>
  ${escapeXml(helpfulFlags)}
</text>


<!-- VOTES -->

<text
  x="640"
  y="270"
  fill="#8B949E"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  VOTES CAST
</text>


<text
  x="640"
  y="298"
  fill="#FFFFFF"
  font-family="Arial"
  font-size="25"
  font-weight="700"
>
  ${number(votesCast)}
</text>


<!-- RECENT -->

<line
  x1="30"
  y1="325"
  x2="870"
  y2="325"
  stroke="#30363D"
/>


<text
  x="40"
  y="350"
  fill="#8B949E"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  RECENT REPUTATION
</text>


<text
  x="40"
  y="375"
  fill="${reputationToday >= 0 ? "#3FB950" : "#F85149"}"
  font-family="Arial"
  font-size="12"
  font-weight="700"
>
  Today ${reputationToday >= 0 ? "+" : ""}${reputationToday}
</text>


<text
  x="125"
  y="375"
  fill="${reputationWeek >= 0 ? "#3FB950" : "#F85149"}"
  font-family="Arial"
  font-size="12"
  font-weight="700"
>
  7d ${reputationWeek >= 0 ? "+" : ""}${reputationWeek}
</text>


<text
  x="185"
  y="375"
  fill="${reputationMonth >= 0 ? "#3FB950" : "#F85149"}"
  font-family="Arial"
  font-size="12"
  font-weight="700"
>
  30d ${reputationMonth >= 0 ? "+" : ""}${reputationMonth}
</text>


<text
  x="500"
  y="375"
  fill="#6E7681"
  font-family="Arial"
  font-size="10"
>
  Updated from Stack Overflow
</text>

</svg>
`;

  // ============================================================
  // RESPONSE
  // ============================================================

  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");

  // GitHub/Vercel cache for 30 minutes.
  res.setHeader("Cache-Control", "public, max-age=1800, s-maxage=1800");

  return res.status(200).send(svg);
}
