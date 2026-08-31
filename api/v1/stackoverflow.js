export default async function handler(req, res) {
  const USER_ID = String(req.query.id || "9202118");
  const SITE = String(req.query.site || "stackoverflow");

  const API = "https://api.stackexchange.com/2.3";

  // ---------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------

  function escapeXml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function formatNumber(value) {
    const n = Number(value);

    if (!Number.isFinite(n)) {
      return "—";
    }

    return new Intl.NumberFormat("en-US").format(n);
  }

  function shortNumber(value) {
    const n = Number(value);

    if (!Number.isFinite(n)) {
      return "—";
    }

    if (n >= 1000000) {
      return `${(n / 1000000).toFixed(1)}M`;
    }

    if (n >= 1000) {
      return `${Math.round(n / 1000)}K`;
    }

    return String(n);
  }

  async function getJson(url) {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "salimmurshed-stackoverflow-card",
      },
    });

    if (!response.ok) {
      throw new Error(`Stack Exchange API ${response.status}`);
    }

    return await response.json();
  }

  async function getHtml(url) {
    const response = await fetch(url, {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/151.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      throw new Error(`Stack Overflow ${response.status}`);
    }

    return await response.text();
  }

  function htmlToText(html) {
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  // ---------------------------------------------------------
  // Main
  // ---------------------------------------------------------

  try {
    // ========================================================
    // 1. STACK EXCHANGE USER API
    // ========================================================

    const userUrl =
      `${API}/users/${encodeURIComponent(USER_ID)}` +
      `?site=${encodeURIComponent(SITE)}`;

    const userData = await getJson(userUrl);

    if (!userData.items || userData.items.length === 0) {
      throw new Error("Stack Overflow user not found");
    }

    const user = userData.items[0];

    // ========================================================
    // REAL API VALUES
    // ========================================================

    const reputation = Number(user.reputation ?? 0);

    const questions = Number(user.question_count ?? 0);

    const answers = Number(user.answer_count ?? 0);

    const upVotes = Number(user.up_vote_count ?? 0);

    const downVotes = Number(user.down_vote_count ?? 0);

    const votesCast = upVotes + downVotes;

    const gold = Number(user.badge_counts?.gold ?? 0);

    const silver = Number(user.badge_counts?.silver ?? 0);

    const bronze = Number(user.badge_counts?.bronze ?? 0);

    const name = user.display_name || "Stack Overflow User";

    const profileImage = user.profile_image || "";

    // IMPORTANT:
    //
    // Stack Exchange user API does NOT provide
    // profile view count.
    //
    // Do NOT use:
    //
    // user.view_count
    //
    // because it doesn't exist.
    //
    const profileViews = "—";

    // ========================================================
    // 2. STACK OVERFLOW PROFILE HTML
    //
    // Current profile exposes:
    //
    // ~149k people reached
    // 29 posts edited
    // 4 helpful flags
    // 205 votes cast
    //
    // ========================================================

    let peopleReached = "—";
    let postsEdited = "—";
    let helpfulFlags = "—";

    try {
      const profileUrl = `https://stackoverflow.com/users/${encodeURIComponent(
        USER_ID,
      )}/${encodeURIComponent(
        name.toLowerCase().replace(/\s+/g, "-"),
      )}?tab=topactivity`;

      const html = await getHtml(profileUrl);

      const text = htmlToText(html);

      // ------------------------------------------------------
      // PEOPLE REACHED
      //
      // ~149k people reached
      // ------------------------------------------------------

      const peopleMatch = text.match(
        /(~\s*[\d,.]+(?:\s*[kKmMbB])?)\s+people\s+reached/i,
      );

      if (peopleMatch) {
        peopleReached = peopleMatch[1].replace(/\s+/g, "");
      }

      // ------------------------------------------------------
      // POSTS EDITED
      //
      // 29 posts edited
      // ------------------------------------------------------

      const editedMatch = text.match(/(\d[\d,]*)\s+posts\s+edited/i);

      if (editedMatch) {
        postsEdited = editedMatch[1];
      }

      // ------------------------------------------------------
      // HELPFUL FLAGS
      //
      // 4 helpful flags
      // ------------------------------------------------------

      const flagsMatch = text.match(/(\d[\d,]*)\s+helpful\s+flags/i);

      if (flagsMatch) {
        helpfulFlags = flagsMatch[1];
      }
    } catch (htmlError) {
      console.error("Profile HTML:", htmlError.message);
    }

    // ========================================================
    // 3. REPUTATION HISTORY
    // ========================================================

    let reputationToday = 0;
    let reputationWeek = 0;
    let reputationMonth = 0;

    let chartValues = [];

    try {
      const reputationUrl =
        `${API}/users/${encodeURIComponent(USER_ID)}` +
        `/reputation-history` +
        `?site=${encodeURIComponent(SITE)}` +
        `&pagesize=100`;

      const reputationData = await getJson(reputationUrl);

      const history = reputationData.items || [];

      const now = Math.floor(Date.now() / 1000);

      const DAY = 60 * 60 * 24;

      reputationToday = history
        .filter((item) => now - Number(item.creation_date) <= DAY)
        .reduce((sum, item) => sum + Number(item.reputation_change || 0), 0);

      reputationWeek = history
        .filter((item) => now - Number(item.creation_date) <= DAY * 7)
        .reduce((sum, item) => sum + Number(item.reputation_change || 0), 0);

      reputationMonth = history
        .filter((item) => now - Number(item.creation_date) <= DAY * 30)
        .reduce((sum, item) => sum + Number(item.reputation_change || 0), 0);

      // ------------------------------------------------------
      // 30 day chart
      // ------------------------------------------------------

      const daily = {};

      for (let i = 29; i >= 0; i--) {
        const date = new Date(Date.now() - i * DAY * 1000);

        const key = date.toISOString().slice(0, 10);

        daily[key] = 0;
      }

      for (const item of history) {
        const key = new Date(Number(item.creation_date) * 1000)
          .toISOString()
          .slice(0, 10);

        if (Object.prototype.hasOwnProperty.call(daily, key)) {
          daily[key] += Number(item.reputation_change || 0);
        }
      }

      chartValues = Object.values(daily);
    } catch (historyError) {
      console.error("Reputation history:", historyError.message);

      chartValues = new Array(30).fill(0);
    }

    // ========================================================
    // 4. CHART
    // ========================================================

    const chartX = 505;
    const chartY = 58;
    const chartWidth = 345;
    const chartHeight = 78;

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

    // ========================================================
    // 5. SVG
    // ========================================================

    const svg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="900"
  height="430"
  viewBox="0 0 900 430"
>

<defs>

  <linearGradient
    id="background"
    x1="0"
    y1="0"
    x2="900"
    y2="430"
  >
    <stop
      offset="0%"
      stop-color="#0d1117"
    />

    <stop
      offset="100%"
      stop-color="#171b22"
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
      stop-color="#f48024"
    />

    <stop
      offset="100%"
      stop-color="#ffb86b"
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
  height="430"
  rx="18"
  fill="url(#background)"
/>


<!-- TOP ACCENT -->

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
  fill="#252a33"
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
  y="58"
  fill="#ffffff"
  font-family="Arial, Helvetica, sans-serif"
  font-size="26"
  font-weight="700"
>
  ${escapeXml(name)}
</text>


<text
  x="140"
  y="84"
  fill="#f48024"
  font-family="Arial, Helvetica, sans-serif"
  font-size="13"
  font-weight="700"
  letter-spacing="1"
>
  STACK OVERFLOW
</text>


<text
  x="140"
  y="108"
  fill="#8b949e"
  font-family="Arial"
  font-size="11"
>
  REPUTATION
</text>


<text
  x="215"
  y="108"
  fill="#ffffff"
  font-family="Arial"
  font-size="14"
  font-weight="700"
>
  ${formatNumber(reputation)}
</text>


<!-- CHART -->

<text
  x="505"
  y="35"
  fill="#8b949e"
  font-family="Arial"
  font-size="11"
  font-weight="600"
>
  30 DAY REPUTATION
</text>


<polyline
  points="${points}"
  fill="none"
  stroke="#f48024"
  stroke-width="3"
  stroke-linecap="round"
  stroke-linejoin="round"
/>


<line
  x1="${chartX}"
  y1="${chartY + chartHeight}"
  x2="${chartX + chartWidth}"
  y2="${chartY + chartHeight}"
  stroke="#30363d"
/>


<!-- DIVIDER -->

<line
  x1="30"
  y1="140"
  x2="870"
  y2="140"
  stroke="#30363d"
/>


<!-- BASIC STATS -->

<text
  x="40"
  y="168"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  QUESTIONS
</text>

<text
  x="40"
  y="197"
  fill="#ffffff"
  font-family="Arial"
  font-size="25"
  font-weight="700"
>
  ${formatNumber(questions)}
</text>


<text
  x="165"
  y="168"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  ANSWERS
</text>

<text
  x="165"
  y="197"
  fill="#ffffff"
  font-family="Arial"
  font-size="25"
  font-weight="700"
>
  ${formatNumber(answers)}
</text>


<text
  x="285"
  y="168"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  PROFILE VIEWS
</text>

<text
  x="285"
  y="197"
  fill="#ffffff"
  font-family="Arial"
  font-size="25"
  font-weight="700"
>
  ${profileViews}
</text>


<text
  x="435"
  y="168"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  VOTES CAST
</text>

<text
  x="435"
  y="197"
  fill="#ffffff"
  font-family="Arial"
  font-size="25"
  font-weight="700"
>
  ${formatNumber(votesCast)}
</text>


<!-- BADGES -->

<text
  x="610"
  y="168"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  BADGES
</text>


<circle
  cx="617"
  cy="190"
  r="6"
  fill="#ffcc00"
/>

<text
  x="631"
  y="195"
  fill="#ffffff"
  font-family="Arial"
  font-size="13"
>
  ${gold}
</text>


<circle
  cx="674"
  cy="190"
  r="6"
  fill="#b4b8bc"
/>

<text
  x="688"
  y="195"
  fill="#ffffff"
  font-family="Arial"
  font-size="13"
>
  ${silver}
</text>


<circle
  cx="735"
  cy="190"
  r="6"
  fill="#d28c45"
/>

<text
  x="749"
  y="195"
  fill="#ffffff"
  font-family="Arial"
  font-size="13"
>
  ${bronze}
</text>


<!-- IMPACT -->

<line
  x1="30"
  y1="225"
  x2="870"
  y2="225"
  stroke="#30363d"
/>


<text
  x="40"
  y="252"
  fill="#f48024"
  font-family="Arial"
  font-size="12"
  font-weight="700"
  letter-spacing="1"
>
  IMPACT
</text>


<!-- PEOPLE REACHED -->

<text
  x="40"
  y="277"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  PEOPLE REACHED
</text>

<text
  x="40"
  y="307"
  fill="#ffffff"
  font-family="Arial"
  font-size="25"
  font-weight="700"
>
  ${escapeXml(peopleReached)}
</text>


<!-- POSTS EDITED -->

<text
  x="250"
  y="277"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  POSTS EDITED
</text>

<text
  x="250"
  y="307"
  fill="#ffffff"
  font-family="Arial"
  font-size="25"
  font-weight="700"
>
  ${escapeXml(postsEdited)}
</text>


<!-- HELPFUL FLAGS -->

<text
  x="450"
  y="277"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  HELPFUL FLAGS
</text>

<text
  x="450"
  y="307"
  fill="#ffffff"
  font-family="Arial"
  font-size="25"
  font-weight="700"
>
  ${escapeXml(helpfulFlags)}
</text>


<!-- UP / DOWN VOTES -->

<text
  x="650"
  y="277"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  UP / DOWN
</text>

<text
  x="650"
  y="307"
  fill="#3fb950"
  font-family="Arial"
  font-size="18"
  font-weight="700"
>
  ${formatNumber(upVotes)}
</text>

<text
  x="705"
  y="307"
  fill="#8b949e"
  font-family="Arial"
  font-size="18"
>
  /
</text>

<text
  x="725"
  y="307"
  fill="#f85149"
  font-family="Arial"
  font-size="18"
  font-weight="700"
>
  ${formatNumber(downVotes)}
</text>


<!-- RECENT REPUTATION -->

<line
  x1="30"
  y1="335"
  x2="870"
  y2="335"
  stroke="#30363d"
/>


<text
  x="40"
  y="362"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  RECENT REPUTATION
</text>


<text
  x="40"
  y="388"
  fill="${reputationToday >= 0 ? "#3fb950" : "#f85149"}"
  font-family="Arial"
  font-size="12"
  font-weight="700"
>
  Today ${reputationToday >= 0 ? "+" : ""}${reputationToday}
</text>


<text
  x="125"
  y="388"
  fill="${reputationWeek >= 0 ? "#3fb950" : "#f85149"}"
  font-family="Arial"
  font-size="12"
  font-weight="700"
>
  7d ${reputationWeek >= 0 ? "+" : ""}${reputationWeek}
</text>


<text
  x="185"
  y="388"
  fill="${reputationMonth >= 0 ? "#3fb950" : "#f85149"}"
  font-family="Arial"
  font-size="12"
  font-weight="700"
>
  30d ${reputationMonth >= 0 ? "+" : ""}${reputationMonth}
</text>


<text
  x="505"
  y="388"
  fill="#6e7681"
  font-family="Arial"
  font-size="10"
>
  Stack Exchange API • Stack Overflow
</text>

</svg>
`;

    // ========================================================
    // RESPONSE
    // ========================================================

    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");

    res.setHeader(
      "Cache-Control",
      "public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600",
    );

    return res.status(200).send(svg);
  } catch (error) {
    // ========================================================
    // ERROR SVG
    // ========================================================

    console.error("Stack Overflow card error:", error);

    const errorSvg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="900"
  height="180"
  viewBox="0 0 900 180"
>

<rect
  width="900"
  height="180"
  rx="18"
  fill="#0d1117"
/>

<rect
  width="900"
  height="4"
  fill="#f48024"
/>

<text
  x="450"
  y="78"
  text-anchor="middle"
  fill="#ffffff"
  font-family="Arial"
  font-size="20"
  font-weight="700"
>
  Stack Overflow statistics unavailable
</text>

<text
  x="450"
  y="108"
  text-anchor="middle"
  fill="#8b949e"
  font-family="Arial"
  font-size="12"
>
  Please try again later
</text>

<text
  x="450"
  y="135"
  text-anchor="middle"
  fill="#6e7681"
  font-family="Arial"
  font-size="10"
>
  User ID: ${escapeXml(USER_ID)}
</text>

</svg>
`;

    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");

    return res.status(200).send(errorSvg);
  }
}
