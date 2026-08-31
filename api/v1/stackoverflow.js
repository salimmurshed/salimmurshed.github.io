export default async function handler(req, res) {
  const userId = String(req.query.id || "9202118").trim();
  const site = String(req.query.site || "stackoverflow").trim();

  const API = "https://api.stackexchange.com/2.3";

  const USER_FILTER = "!)RL-JogHwoZuazwo6-n_WuMc";

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------

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

    if (!Number.isFinite(n)) return "—";

    return new Intl.NumberFormat("en-US").format(n);
  }

  function shortNumber(value) {
    const n = Number(value);

    if (!Number.isFinite(n)) return "—";

    if (n >= 1000000) {
      return `${(n / 1000000).toFixed(1)}M`;
    }

    if (n >= 1000) {
      return `${(n / 1000).toFixed(1)}K`;
    }

    return String(n);
  }

  async function fetchJson(url) {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "StackOverflow-Stats-Card",
      },
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Stack Exchange HTTP ${response.status}`);
    }

    let json;

    try {
      json = JSON.parse(text);
    } catch {
      throw new Error("Invalid Stack Exchange JSON");
    }

    if (json.error_id) {
      throw new Error(`${json.error_name}: ${json.error_message}`);
    }

    return json;
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
      throw new Error(`Stack Overflow HTTP ${response.status}`);
    }

    return await response.text();
  }

  function htmlToText(html) {
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&#x27;/gi, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  function parseLargestNumber(matches) {
    if (!matches || matches.length === 0) {
      return "—";
    }

    let largest = 0;
    let result = matches[0];

    for (const value of matches) {
      const clean = value.replace(/~/g, "").replace(/,/g, "").trim();

      const multiplier = /k$/i.test(clean)
        ? 1000
        : /m$/i.test(clean)
          ? 1000000
          : 1;

      const numeric = parseFloat(clean) * multiplier;

      if (Number.isFinite(numeric) && numeric > largest) {
        largest = numeric;
        result = value;
      }
    }

    return result.replace(/\s+/g, "");
  }

  // ----------------------------------------------------------
  // ERROR
  // ----------------------------------------------------------

  function sendError(message) {
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
    fill="#f48024"
  />

  <text
    x="450"
    y="85"
    text-anchor="middle"
    fill="#ffffff"
    font-family="Arial"
    font-size="22"
    font-weight="700"
  >
    Stack Overflow Statistics Error
  </text>

  <text
    x="450"
    y="120"
    text-anchor="middle"
    fill="#f85149"
    font-family="Arial"
    font-size="13"
  >
    ${escapeXml(message)}
  </text>

  <text
    x="450"
    y="155"
    text-anchor="middle"
    fill="#8b949e"
    font-family="Arial"
    font-size="12"
  >
    User ID: ${escapeXml(userId)}
  </text>
</svg>
`;

    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    return res.status(200).send(svg);
  }

  try {
    // ========================================================
    // USER API
    // ========================================================

    const userUrl =
      `${API}/users/${encodeURIComponent(userId)}` +
      `?site=${encodeURIComponent(site)}` +
      `&filter=${encodeURIComponent(USER_FILTER)}`;

    const userData = await fetchJson(userUrl);

    if (!userData.items || userData.items.length === 0) {
      throw new Error(`User ${userId} not found`);
    }

    const user = userData.items[0];

    // ========================================================
    // REAL TOTALS
    // ========================================================

    const reputation = Number(user.reputation || 0);

    const questions = Number(user.question_count || 0);

    const answers = Number(user.answer_count || 0);

    const profileViews = Number(user.view_count || 0);

    const upVotes = Number(user.up_vote_count || 0);

    const downVotes = Number(user.down_vote_count || 0);

    const votesCast = upVotes + downVotes;

    const gold = Number(user.badge_counts?.gold || 0);

    const silver = Number(user.badge_counts?.silver || 0);

    const bronze = Number(user.badge_counts?.bronze || 0);

    // ========================================================
    // PROFILE HTML
    // ========================================================

    let peopleReached = "—";
    let postsEdited = "—";
    let helpfulFlags = "—";

    try {
      const profileUrl = `https://stackoverflow.com/users/${userId}`;

      const html = await fetchHtml(profileUrl);

      const text = htmlToText(html);

      // ------------------------------------------------------
      // PEOPLE REACHED
      // ------------------------------------------------------

      const peopleRegex = /(~?\s*[\d,.]+\s*[KMB]?)\s+people\s+reached/gi;

      const peopleMatches = [];

      let match;

      while ((match = peopleRegex.exec(text)) !== null) {
        peopleMatches.push(match[1]);
      }

      peopleReached = parseLargestNumber(peopleMatches);

      // ------------------------------------------------------
      // POSTS EDITED
      // ------------------------------------------------------

      const edited = text.match(/(\d[\d,]*)\s+posts\s+edited/i);

      if (edited) {
        postsEdited = edited[1];
      }

      // ------------------------------------------------------
      // HELPFUL FLAGS
      // ------------------------------------------------------

      const flags = text.match(/(\d[\d,]*)\s+helpful\s+flags/i);

      if (flags) {
        helpfulFlags = flags[1];
      }
    } catch (e) {
      console.error("Profile HTML error:", e.message);
    }

    // ========================================================
    // REPUTATION HISTORY
    // ========================================================

    let today = 0;
    let week = 0;
    let month = 0;

    const daily = {};

    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);

      daily[date.toISOString().slice(0, 10)] = 0;
    }

    try {
      const historyUrl =
        `${API}/users/${userId}/reputation-history` +
        `?site=${site}` +
        `&pagesize=100`;

      const historyData = await fetchJson(historyUrl);

      const history = historyData.items || [];

      const now = Math.floor(Date.now() / 1000);

      today = history
        .filter((x) => now - Number(x.creation_date) <= 86400)
        .reduce((sum, x) => sum + Number(x.reputation_change || 0), 0);

      week = history
        .filter((x) => now - Number(x.creation_date) <= 86400 * 7)
        .reduce((sum, x) => sum + Number(x.reputation_change || 0), 0);

      month = history
        .filter((x) => now - Number(x.creation_date) <= 86400 * 30)
        .reduce((sum, x) => sum + Number(x.reputation_change || 0), 0);

      for (const item of history) {
        const date = new Date(Number(item.creation_date) * 1000)
          .toISOString()
          .slice(0, 10);

        if (Object.prototype.hasOwnProperty.call(daily, date)) {
          daily[date] += Number(item.reputation_change || 0);
        }
      }
    } catch (e) {
      console.error("Reputation history:", e.message);
    }

    // ========================================================
    // CHART
    // ========================================================

    const values = Object.values(daily);

    const chartX = 500;
    const chartY = 60;
    const chartWidth = 350;
    const chartHeight = 80;

    const min = Math.min(...values, 0);

    const max = Math.max(...values, 1);

    const range = max - min || 1;

    const points = values
      .map((value, index) => {
        const x =
          chartX + (index / Math.max(values.length - 1, 1)) * chartWidth;

        const y = chartY + chartHeight - ((value - min) / range) * chartHeight;

        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    // ========================================================
    // SVG
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
    id="orange"
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

  <clipPath id="avatarClip">
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
  fill="#252a33"
/>

<image
  href="${escapeXml(user.profile_image)}"
  x="30"
  y="28"
  width="84"
  height="84"
  clip-path="url(#avatarClip)"
  preserveAspectRatio="xMidYMid slice"
/>


<!-- NAME -->

<text
  x="140"
  y="60"
  fill="#ffffff"
  font-family="Arial"
  font-size="26"
  font-weight="700"
>
  ${escapeXml(user.display_name)}
</text>


<text
  x="140"
  y="85"
  fill="#f48024"
  font-family="Arial"
  font-size="13"
  font-weight="700"
  letter-spacing="1"
>
  STACK OVERFLOW
</text>


<text
  x="140"
  y="110"
  fill="#8b949e"
  font-family="Arial"
  font-size="12"
>
  REPUTATION
</text>


<text
  x="215"
  y="110"
  fill="#ffffff"
  font-family="Arial"
  font-size="14"
  font-weight="700"
>
  ${formatNumber(reputation)}
</text>


<!-- CHART -->

<text
  x="500"
  y="35"
  fill="#8b949e"
  font-family="Arial"
  font-size="11"
  font-weight="700"
>
  30 DAY REPUTATION ACTIVITY
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


<!-- ROW 1 -->

<text
  x="40"
  y="166"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="700"
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
  ${formatNumber(questions)}
</text>


<text
  x="240"
  y="166"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="700"
>
  ANSWERS
</text>

<text
  x="240"
  y="198"
  fill="#ffffff"
  font-family="Arial"
  font-size="26"
  font-weight="700"
>
  ${formatNumber(answers)}
</text>


<text
  x="440"
  y="166"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="700"
>
  PROFILE VIEWS
</text>

<text
  x="440"
  y="198"
  fill="#ffffff"
  font-family="Arial"
  font-size="26"
  font-weight="700"
>
  ${formatNumber(profileViews)}
</text>


<text
  x="650"
  y="166"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="700"
>
  VOTES CAST
</text>

<text
  x="650"
  y="198"
  fill="#ffffff"
  font-family="Arial"
  font-size="26"
  font-weight="700"
>
  ${formatNumber(votesCast)}
</text>


<!-- ROW 2 -->

<text
  x="40"
  y="245"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="700"
>
  PEOPLE REACHED
</text>

<text
  x="40"
  y="278"
  fill="#ffffff"
  font-family="Arial"
  font-size="25"
  font-weight="700"
>
  ${escapeXml(peopleReached)}
</text>


<text
  x="240"
  y="245"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="700"
>
  POSTS EDITED
</text>

<text
  x="240"
  y="278"
  fill="#ffffff"
  font-family="Arial"
  font-size="25"
  font-weight="700"
>
  ${escapeXml(postsEdited)}
</text>


<text
  x="440"
  y="245"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="700"
>
  HELPFUL FLAGS
</text>

<text
  x="440"
  y="278"
  fill="#ffffff"
  font-family="Arial"
  font-size="25"
  font-weight="700"
>
  ${escapeXml(helpfulFlags)}
</text>


<!-- BADGES -->

<text
  x="650"
  y="245"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="700"
>
  BADGES
</text>


<circle
  cx="657"
  cy="268"
  r="6"
  fill="#ffcc00"
/>

<text
  x="670"
  y="273"
  fill="#ffffff"
  font-family="Arial"
  font-size="13"
>
  ${gold}
</text>


<circle
  cx="710"
  cy="268"
  r="6"
  fill="#b4b8bc"
/>

<text
  x="723"
  y="273"
  fill="#ffffff"
  font-family="Arial"
  font-size="13"
>
  ${silver}
</text>


<circle
  cx="770"
  cy="268"
  r="6"
  fill="#d28c45"
/>

<text
  x="783"
  y="273"
  fill="#ffffff"
  font-family="Arial"
  font-size="13"
>
  ${bronze}
</text>


<!-- RECENT -->

<line
  x1="30"
  y1="315"
  x2="870"
  y2="315"
  stroke="#30363d"
/>


<text
  x="40"
  y="343"
  fill="#8b949e"
  font-family="Arial"
  font-size="10"
  font-weight="700"
>
  RECENT REPUTATION
</text>


<text
  x="40"
  y="370"
  fill="#3fb950"
  font-family="Arial"
  font-size="12"
  font-weight="700"
>
  Today ${today >= 0 ? "+" : ""}${today}
</text>


<text
  x="125"
  y="370"
  fill="#3fb950"
  font-family="Arial"
  font-size="12"
  font-weight="700"
>
  7d ${week >= 0 ? "+" : ""}${week}
</text>


<text
  x="185"
  y="370"
  fill="#3fb950"
  font-family="Arial"
  font-size="12"
  font-weight="700"
>
  30d ${month >= 0 ? "+" : ""}${month}
</text>


<text
  x="500"
  y="370"
  fill="#6e7681"
  font-family="Arial"
  font-size="10"
>
  Stack Exchange API • Automatically updated
</text>

</svg>
`;

    // ========================================================
    // RESPONSE
    // ========================================================

    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");

    // Don't cache during testing.
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    return res.status(200).send(svg);
  } catch (error) {
    console.error(error);

    return sendError(error.message || "Unknown error");
  }
}
