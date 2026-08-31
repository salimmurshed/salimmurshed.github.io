export default async function handler(req, res) {
  const userId = String(req.query.id || "").trim();
  const site = String(req.query.site || "stackoverflow").trim();

  if (!userId) {
    return sendError(res, "Missing user ID. Use ?id=9202118");
  }

  const API = "https://api.stackexchange.com/2.3";

  // ---------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------

  const escapeXml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const number = (value) => {
    const n = Number(value);

    if (!Number.isFinite(n)) {
      return "—";
    }

    return new Intl.NumberFormat("en-US").format(n);
  };

  const shortNumber = (value) => {
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
  };

  async function fetchJson(url) {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 Salim-Murshed-StackOverflow-Stats",
      },
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Stack Exchange returned invalid JSON");
    }

    if (data.error_id) {
      throw new Error(
        `${data.error_name || "API error"}: ${data.error_message || ""}`,
      );
    }

    return data;
  }

  async function fetchHtml(url) {
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
      throw new Error(`Stack Overflow profile HTTP ${response.status}`);
    }

    return response.text();
  }

  function htmlToText(html) {
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&#x27;/gi, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  // ---------------------------------------------------------
  // ERROR SVG
  // ---------------------------------------------------------

  function sendError(res, message) {
    const svg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="900"
  height="220"
  viewBox="0 0 900 220"
>
  <rect
    width="900"
    height="220"
    rx="18"
    fill="#0d1117"
  />

  <rect
    width="900"
    height="5"
    rx="3"
    fill="#f48024"
  />

  <text
    x="450"
    y="90"
    text-anchor="middle"
    fill="#ffffff"
    font-family="Arial, Helvetica, sans-serif"
    font-size="22"
    font-weight="700"
  >
    Stack Overflow Statistics Error
  </text>

  <text
    x="450"
    y="125"
    text-anchor="middle"
    fill="#f85149"
    font-family="Arial, Helvetica, sans-serif"
    font-size="13"
  >
    ${escapeXml(message)}
  </text>

  <text
    x="450"
    y="160"
    text-anchor="middle"
    fill="#8b949e"
    font-family="Arial, Helvetica, sans-serif"
    font-size="12"
  >
    Check /api/stackoverflow?id=YOUR_USER_ID
  </text>
</svg>
`;

    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    return res.status(200).send(svg);
  }

  try {
    // =======================================================
    // 1. USER API
    //
    // IMPORTANT:
    // Explicit filter=default makes sure we are requesting
    // the normal User object fields.
    // =======================================================

    const userUrl =
      `${API}/users/${encodeURIComponent(userId)}` +
      `?site=${encodeURIComponent(site)}` +
      `&filter=default`;

    const userData = await fetchJson(userUrl);

    if (!Array.isArray(userData.items)) {
      throw new Error("Invalid user API response");
    }

    if (userData.items.length === 0) {
      throw new Error(`User ${userId} was not found on ${site}`);
    }

    const user = userData.items[0];

    // =======================================================
    // 2. READ REAL USER FIELDS
    // =======================================================

    const reputation = Number(user.reputation);

    const questions = Number(user.question_count);

    const answers = Number(user.answer_count);

    const profileViews = Number(user.view_count);

    const upVotes = Number(user.up_vote_count);

    const downVotes = Number(user.down_vote_count);

    // votes cast = up + down
    const votesCast = upVotes + downVotes;

    const gold = Number(user.badge_counts?.gold || 0);

    const silver = Number(user.badge_counts?.silver || 0);

    const bronze = Number(user.badge_counts?.bronze || 0);

    // -------------------------------------------------------
    // IMPORTANT DEBUG CHECK
    // -------------------------------------------------------

    console.log("STACK OVERFLOW USER DATA:", {
      userId,
      reputation,
      questions,
      answers,
      profileViews,
      upVotes,
      downVotes,
      votesCast,
      rawUser: user,
    });

    // If any required API field is genuinely missing,
    // DO NOT silently convert it to zero.
    if (!Number.isFinite(questions)) {
      throw new Error("question_count missing from Stack Exchange API");
    }

    if (!Number.isFinite(answers)) {
      throw new Error("answer_count missing from Stack Exchange API");
    }

    if (!Number.isFinite(profileViews)) {
      throw new Error("view_count missing from Stack Exchange API");
    }

    if (!Number.isFinite(upVotes)) {
      throw new Error("up_vote_count missing from Stack Exchange API");
    }

    if (!Number.isFinite(downVotes)) {
      throw new Error("down_vote_count missing from Stack Exchange API");
    }

    // =======================================================
    // 3. REPUTATION HISTORY
    // =======================================================

    let reputationToday = 0;
    let reputationWeek = 0;
    let reputationMonth = 0;

    const daily = {};

    const DAY = 86400;

    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * DAY * 1000);

      daily[d.toISOString().slice(0, 10)] = 0;
    }

    try {
      const reputationUrl =
        `${API}/users/${encodeURIComponent(userId)}/reputation-history` +
        `?site=${encodeURIComponent(site)}` +
        `&pagesize=100`;

      const reputationData = await fetchJson(reputationUrl);

      const history = reputationData.items || [];

      const now = Math.floor(Date.now() / 1000);

      reputationToday = history
        .filter((item) => now - Number(item.creation_date) <= DAY)
        .reduce(
          (total, item) => total + Number(item.reputation_change || 0),
          0,
        );

      reputationWeek = history
        .filter((item) => now - Number(item.creation_date) <= DAY * 7)
        .reduce(
          (total, item) => total + Number(item.reputation_change || 0),
          0,
        );

      reputationMonth = history
        .filter((item) => now - Number(item.creation_date) <= DAY * 30)
        .reduce(
          (total, item) => total + Number(item.reputation_change || 0),
          0,
        );

      for (const item of history) {
        const key = new Date(Number(item.creation_date) * 1000)
          .toISOString()
          .slice(0, 10);

        if (Object.prototype.hasOwnProperty.call(daily, key)) {
          daily[key] += Number(item.reputation_change || 0);
        }
      }
    } catch (historyError) {
      console.error("Reputation history error:", historyError);
    }

    // =======================================================
    // 4. PEOPLE REACHED / EDITS / FLAGS
    //
    // These are NOT User API fields.
    // Try to read them from Stack Overflow profile HTML.
    // =======================================================

    let peopleReached = "—";
    let postsEdited = "—";
    let helpfulFlags = "—";

    try {
      const profileUrl =
        user.link || `https://stackoverflow.com/users/${userId}`;

      const profileHtml = await fetchHtml(profileUrl);

      const profileText = htmlToText(profileHtml);

      console.log("STACK OVERFLOW PROFILE TEXT:", profileText.slice(0, 5000));

      // ---------------------------------------------
      // People reached
      // ---------------------------------------------

      const peopleMatch = profileText.match(
        /(~?\s*[\d,.]+(?:\s*[KMB])?)\s+people\s+reached/i,
      );

      if (peopleMatch) {
        peopleReached = peopleMatch[1].replace(/\s+/g, "");
      }

      // ---------------------------------------------
      // Posts edited
      // ---------------------------------------------

      const editedMatch = profileText.match(/(\d[\d,.]*)\s+posts\s+edited/i);

      if (editedMatch) {
        postsEdited = editedMatch[1];
      }

      // ---------------------------------------------
      // Helpful flags
      // ---------------------------------------------

      const flagsMatch = profileText.match(/(\d[\d,.]*)\s+helpful\s+flags/i);

      if (flagsMatch) {
        helpfulFlags = flagsMatch[1];
      }
    } catch (profileError) {
      console.error("Profile HTML error:", profileError);
    }

    // =======================================================
    // 5. CHART
    // =======================================================

    const chartValues = Object.values(daily);

    const chartX = 510;
    const chartY = 55;
    const chartWidth = 340;
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

    // =======================================================
    // 6. SVG
    // =======================================================

    const svg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="900"
  height="430"
  viewBox="0 0 900 430"
>

<defs>

  <linearGradient
    id="bg"
    x1="0"
    y1="0"
    x2="900"
    y2="430"
  >
    <stop
      offset="0"
      stop-color="#0d1117"
    />

    <stop
      offset="1"
      stop-color="#171b22"
    />
  </linearGradient>

  <linearGradient
    id="accent"
    x1="0"
    y1="0"
    x2="900"
    y2="0"
  >
    <stop
      offset="0"
      stop-color="#f48024"
    />

    <stop
      offset="1"
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


<!-- Background -->

<rect
  width="900"
  height="430"
  rx="18"
  fill="url(#bg)"
/>


<!-- Accent -->

<rect
  width="900"
  height="5"
  rx="3"
  fill="url(#accent)"
/>


<!-- Avatar -->

<circle
  cx="72"
  cy="70"
  r="47"
  fill="#252a33"
/>

${
  user.profile_image
    ? `
<image
  href="${escapeXml(user.profile_image)}"
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


<!-- Name -->

<text
  x="140"
  y="58"
  fill="#ffffff"
  font-family="Arial, Helvetica, sans-serif"
  font-size="26"
  font-weight="700"
>
  ${escapeXml(user.display_name)}
</text>


<text
  x="140"
  y="83"
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
  ${number(reputation)}
</text>


<!-- Chart -->

<text
  x="510"
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


<!-- Divider -->

<line
  x1="30"
  y1="140"
  x2="870"
  y2="140"
  stroke="#30363d"
/>


<!-- Questions -->

<text
  x="40"
  y="166"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  QUESTIONS
</text>

<text
  x="40"
  y="198"
  fill="#ffffff"
  font-family="Arial"
  font-size="26"
  font-weight="700"
>
  ${number(questions)}
</text>


<!-- Answers -->

<text
  x="165"
  y="166"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  ANSWERS
</text>

<text
  x="165"
  y="198"
  fill="#ffffff"
  font-family="Arial"
  font-size="26"
  font-weight="700"
>
  ${number(answers)}
</text>


<!-- Profile views -->

<text
  x="285"
  y="166"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  PROFILE VIEWS
</text>

<text
  x="285"
  y="198"
  fill="#ffffff"
  font-family="Arial"
  font-size="26"
  font-weight="700"
>
  ${shortNumber(profileViews)}
</text>


<!-- Votes cast -->

<text
  x="435"
  y="166"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  VOTES CAST
</text>

<text
  x="435"
  y="198"
  fill="#ffffff"
  font-family="Arial"
  font-size="26"
  font-weight="700"
>
  ${number(votesCast)}
</text>


<!-- Badges -->

<text
  x="610"
  y="166"
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
  x="630"
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
  x="687"
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
  x="748"
  y="195"
  fill="#ffffff"
  font-family="Arial"
  font-size="13"
>
  ${bronze}
</text>


<!-- Impact -->

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


<!-- People -->

<text
  x="40"
  y="278"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  PEOPLE REACHED
</text>

<text
  x="40"
  y="308"
  fill="#ffffff"
  font-family="Arial"
  font-size="24"
  font-weight="700"
>
  ${escapeXml(peopleReached)}
</text>


<!-- Edited -->

<text
  x="250"
  y="278"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  POSTS EDITED
</text>

<text
  x="250"
  y="308"
  fill="#ffffff"
  font-family="Arial"
  font-size="24"
  font-weight="700"
>
  ${escapeXml(postsEdited)}
</text>


<!-- Flags -->

<text
  x="450"
  y="278"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  HELPFUL FLAGS
</text>

<text
  x="450"
  y="308"
  fill="#ffffff"
  font-family="Arial"
  font-size="24"
  font-weight="700"
>
  ${escapeXml(helpfulFlags)}
</text>


<!-- Up / Down -->

<text
  x="650"
  y="278"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  UP / DOWN
</text>

<text
  x="650"
  y="308"
  fill="#3fb950"
  font-family="Arial"
  font-size="17"
  font-weight="700"
>
  ${number(upVotes)}
</text>

<text
  x="705"
  y="308"
  fill="#8b949e"
  font-family="Arial"
  font-size="17"
>
  /
</text>

<text
  x="725"
  y="308"
  fill="#f85149"
  font-family="Arial"
  font-size="17"
  font-weight="700"
>
  ${number(downVotes)}
</text>


<!-- Recent reputation -->

<line
  x1="30"
  y1="335"
  x2="870"
  y2="335"
  stroke="#30363d"
/>


<text
  x="40"
  y="360"
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
  fill="#3fb950"
  font-family="Arial"
  font-size="12"
  font-weight="700"
>
  Today ${reputationToday >= 0 ? "+" : ""}${reputationToday}
</text>


<text
  x="125"
  y="388"
  fill="#3fb950"
  font-family="Arial"
  font-size="12"
  font-weight="700"
>
  7d ${reputationWeek >= 0 ? "+" : ""}${reputationWeek}
</text>


<text
  x="185"
  y="388"
  fill="#3fb950"
  font-family="Arial"
  font-size="12"
  font-weight="700"
>
  30d ${reputationMonth >= 0 ? "+" : ""}${reputationMonth}
</text>


<text
  x="510"
  y="388"
  fill="#6e7681"
  font-family="Arial"
  font-size="10"
>
  Stack Exchange API • ${escapeXml(site)}
</text>

</svg>
`;

    // =======================================================
    // RESPONSE
    // =======================================================

    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");

    res.setHeader("Cache-Control", "public, max-age=1800, s-maxage=1800");

    return res.status(200).send(svg);
  } catch (error) {
    console.error("STACK OVERFLOW CARD ERROR:", error);

    return sendError(res, error.message || "Unknown error");
  }
}
