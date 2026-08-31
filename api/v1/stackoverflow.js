export default async function handler(req, res) {
  const USER_ID = String(req.query.id || "9202118");
  const SITE = String(req.query.site || "stackoverflow");
  const TAG_LIMIT = Math.min(Number(req.query.tags) || 6, 8);

  const API = "https://api.stackexchange.com/2.3";

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

  const number = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? new Intl.NumberFormat("en-US").format(n) : "0";
  };

  const shortNumber = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "0";
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  // =========================================================
  // JSON FETCH — with a short retry, since the SE API can
  // hiccup on serverless cold starts. This is now the ONLY
  // data source in this file: no HTML scraping anywhere.
  // =========================================================

  async function getJson(url, options = {}, attempts = 2) {
    let lastError;

    for (let i = 0; i < attempts; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            Accept: "application/json",
            "User-Agent": "Salim-Murshed-StackOverflow-Stats",
            ...(options.headers || {}),
          },
        });

        const text = await response.text();

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${text.slice(0, 300)}`);
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Stack Exchange returned invalid JSON");
        }

        if (data.error_id) {
          throw new Error(`${data.error_name}: ${data.error_message}`);
        }

        return data;
      } catch (error) {
        lastError = error;
        if (i < attempts - 1) {
          await new Promise((r) => setTimeout(r, 300));
        }
      }
    }

    throw lastError;
  }

  // =========================================================
  // CUSTOM FILTER (best-effort)
  //
  // Some /users/{id} fields (view_count, up_vote_count,
  // down_vote_count) require a non-default filter to appear.
  // We try to build one via /filters/create. If this call
  // fails for any reason (network hiccup, rate limit, cold
  // start), we DON'T let it break the whole card — we just
  // mark those specific fields as unavailable ("—") instead
  // of silently showing a false "0".
  // =========================================================

  async function getUserFilter() {
    const includeFields = [
      "user.answer_count",
      "user.question_count",
      "user.up_vote_count",
      "user.down_vote_count",
      "user.view_count",
    ];

    const url =
      `${API}/filters/create` +
      `?include=${encodeURIComponent(includeFields.join(";"))}` +
      `&base=default&unsafe=false`;

    try {
      const data = await getJson(url);
      const filter = data.items?.[0]?.filter || "";

      if (!filter) {
        console.error("Filter creation returned no filter string");
      }

      return filter;
    } catch (error) {
      console.error("Filter creation failed:", error.message);
      return "";
    }
  }

  // =========================================================
  // GET USER
  // =========================================================

  async function getUser(filter) {
    const url =
      `${API}/users/${encodeURIComponent(USER_ID)}` +
      `?site=${encodeURIComponent(SITE)}` +
      (filter ? `&filter=${encodeURIComponent(filter)}` : "");

    const data = await getJson(url);

    if (!data.items || data.items.length === 0) {
      throw new Error(`Stack Overflow user ${USER_ID} not found`);
    }

    return data.items[0];
  }

  // =========================================================
  // QUESTION / ANSWER COUNTS  (NEW — do not depend on the
  // custom filter at all)
  //
  // The built-in "total" filter is a permanent, documented
  // Stack Exchange filter name that works on ANY list endpoint
  // and just returns {total: N}. It needs no filter-creation
  // step and cannot silently omit fields, so this is the most
  // reliable way to get these two counts no matter what.
  // =========================================================

  async function getQuestionCount() {
    const url =
      `${API}/users/${encodeURIComponent(USER_ID)}/questions` +
      `?site=${encodeURIComponent(SITE)}&filter=total`;

    try {
      const data = await getJson(url);
      return Number(data.total || 0);
    } catch (error) {
      console.error("Question count:", error.message);
      return null; // null = genuinely unknown, distinct from a real 0
    }
  }

  async function getAnswerCount() {
    const url =
      `${API}/users/${encodeURIComponent(USER_ID)}/answers` +
      `?site=${encodeURIComponent(SITE)}&filter=total`;

    try {
      const data = await getJson(url);
      return Number(data.total || 0);
    } catch (error) {
      console.error("Answer count:", error.message);
      return null;
    }
  }

  // =========================================================
  // REPUTATION HISTORY
  // =========================================================

  async function getReputation() {
    const url =
      `${API}/users/${encodeURIComponent(USER_ID)}` +
      `/reputation-history` +
      `?site=${encodeURIComponent(SITE)}` +
      `&pagesize=100`;

    try {
      const data = await getJson(url);
      return data.items || [];
    } catch (error) {
      console.error("Reputation history:", error.message);
      return [];
    }
  }

  // =========================================================
  // TOP TAGS — real API data (/users/{ids}/tags), sorted by
  // popularity. Reliable, no scraping, no blocking risk.
  // =========================================================

  async function getTopTags() {
    const url =
      `${API}/users/${encodeURIComponent(USER_ID)}/tags` +
      `?site=${encodeURIComponent(SITE)}` +
      `&sort=popular&order=desc&pagesize=${TAG_LIMIT}`;

    try {
      const data = await getJson(url);

      return (data.items || []).map((item) => ({
        name: item.tag_name || item.name,
        count: Number(item.count || 0),
      }));
    } catch (error) {
      console.error("Top tags:", error.message);
      return [];
    }
  }

  // =========================================================
  // MAIN
  // =========================================================

  try {
    const userFilter = await getUserFilter();
    const filterAvailable = Boolean(userFilter);

    const [
      user,
      reputationHistory,
      topTags,
      questionCountResult,
      answerCountResult,
    ] = await Promise.all([
      getUser(userFilter),
      getReputation(),
      getTopTags(),
      getQuestionCount(),
      getAnswerCount(),
    ]);

    // =======================================================
    // CORE STATS
    //
    // Questions/Answers ALWAYS come from the dedicated
    // total-filter calls (reliable regardless of the custom
    // filter's success). View/vote counts depend on the
    // custom filter — when that filter failed, we show "—"
    // instead of a false "0".
    // =======================================================

    const reputation = Number(user.reputation || 0);

    const questions =
      questionCountResult !== null
        ? questionCountResult
        : Number(user.question_count || 0);

    const answers =
      answerCountResult !== null
        ? answerCountResult
        : Number(user.answer_count || 0);

    const hasVoteViewData =
      filterAvailable &&
      (user.view_count !== undefined ||
        user.up_vote_count !== undefined ||
        user.down_vote_count !== undefined);

    const profileViews = hasVoteViewData ? Number(user.view_count || 0) : null;
    const upVotes = Number(user.up_vote_count || 0);
    const downVotes = Number(user.down_vote_count || 0);
    const votesCast = hasVoteViewData ? upVotes + downVotes : null;

    const gold = Number(user.badge_counts?.gold || 0);
    const silver = Number(user.badge_counts?.silver || 0);
    const bronze = Number(user.badge_counts?.bronze || 0);

    // =======================================================
    // RECENT REPUTATION
    // =======================================================

    const now = Math.floor(Date.now() / 1000);
    let today = 0;
    let week = 0;
    let month = 0;

    for (const item of reputationHistory) {
      const timestamp = Number(item.creation_date || 0);
      const change = Number(item.reputation_change || 0);
      const age = now - timestamp;

      if (age <= 86400) today += change;
      if (age <= 86400 * 7) week += change;
      if (age <= 86400 * 30) month += change;
    }

    // =======================================================
    // 30 DAY REPUTATION CHART
    // =======================================================

    const daily = {};

    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const key = date.toISOString().slice(0, 10);
      daily[key] = 0;
    }

    for (const item of reputationHistory) {
      const timestamp = Number(item.creation_date || 0);
      if (!timestamp) continue;

      const date = new Date(timestamp * 1000).toISOString().slice(0, 10);
      if (Object.prototype.hasOwnProperty.call(daily, date)) {
        daily[date] += Number(item.reputation_change || 0);
      }
    }

    const chartValues = Object.values(daily);
    const chartX = 490;
    const chartY = 50;
    const chartWidth = 370;
    const chartHeight = 62;
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

    // Filled area under the chart line, for a bit more polish
    const areaPath =
      chartValues.length > 1
        ? `M${chartX},${chartY + chartHeight} L${points} L${chartX + chartWidth},${chartY + chartHeight} Z`
        : "";

    // =======================================================
    // TOP TAGS ROW
    // =======================================================

    const tagColors = [
      "#F48024",
      "#3FB950",
      "#58A6FF",
      "#D2A8FF",
      "#F778BA",
      "#FFA657",
      "#79C0FF",
      "#7EE787",
    ];

    let tagX = 40;
    const tagY = 366;
    const tagPillHeight = 30;
    const tagGap = 12;
    const tagCharWidth = 7.2;
    const tagPadding = 34;

    const tagPills = topTags.length
      ? topTags
          .map((tag, index) => {
            const label = tag.name;
            const countLabel = shortNumber(tag.count);
            const pillWidth =
              label.length * tagCharWidth + countLabel.length * 8 + tagPadding;

            const pill = `
  <g transform="translate(${tagX}, ${tagY})">
    <rect
      width="${pillWidth.toFixed(1)}"
      height="${tagPillHeight}"
      rx="15"
      fill="#1C2129"
      stroke="${tagColors[index % tagColors.length]}"
      stroke-width="1.5"
    />
    <text x="14" y="20" fill="#E6EDF3" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="600">${escapeXml(label)}</text>
    <text x="${pillWidth - 12}" y="20" text-anchor="end" fill="${tagColors[index % tagColors.length]}" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700">${countLabel}</text>
  </g>`;

            tagX += pillWidth + tagGap;
            return pill;
          })
          .join("")
      : `
  <text x="40" y="${tagY + 20}" fill="#6E7681" font-family="Arial, Helvetica, sans-serif" font-size="13">No tag data available</text>`;

    // =======================================================
    // PROFILE IMAGE
    // =======================================================

    const profileImage = user.profile_image || "";

    // =======================================================
    // SVG
    // =======================================================

    const svg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="900"
  height="430"
  viewBox="0 0 900 430"
>

  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="900" y2="430">
      <stop offset="0" stop-color="#0D1117" />
      <stop offset="1" stop-color="#171B22" />
    </linearGradient>

    <linearGradient id="accent" x1="0" y1="0" x2="900" y2="0">
      <stop offset="0" stop-color="#F48024" />
      <stop offset="1" stop-color="#FFB86B" />
    </linearGradient>

    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F48024" stop-opacity="0.35" />
      <stop offset="1" stop-color="#F48024" stop-opacity="0" />
    </linearGradient>

    <clipPath id="avatar">
      <circle cx="72" cy="70" r="42" />
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="900" height="430" rx="18" fill="url(#background)" />

  <!-- Top accent line -->
  <rect width="900" height="5" rx="3" fill="url(#accent)" />

  <!-- Avatar -->
  <circle cx="72" cy="70" r="47" fill="#252A33" />
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
  />`
      : ""
  }

  <!-- Name + reputation -->
  <text x="140" y="58" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700">
    ${escapeXml(user.display_name)}
  </text>

  <text x="140" y="84" fill="#F48024" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" letter-spacing="1.2">
    STACK OVERFLOW
  </text>

  <circle cx="146" cy="106" r="3" fill="#F48024" />
  <text x="156" y="110" fill="#8B949E" font-family="Arial, Helvetica, sans-serif" font-size="12">
    REPUTATION
  </text>
  <text x="245" y="110" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700">
    ${number(reputation)}
  </text>

  <!-- 30 day reputation chart -->
  <text x="${chartX}" y="30" fill="#8B949E" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700" letter-spacing="0.5">
    30 DAY REPUTATION ACTIVITY
  </text>

  ${areaPath ? `<path d="${areaPath}" fill="url(#chartFill)" />` : ""}

  <polyline
    points="${points}"
    fill="none"
    stroke="#F48024"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  <line x1="${chartX}" y1="${chartY + chartHeight}" x2="${chartX + chartWidth}" y2="${chartY + chartHeight}" stroke="#30363D" />

  <!-- Divider -->
  <line x1="30" y1="140" x2="870" y2="140" stroke="#30363D" />

  <!-- Row 1: Questions / Answers / Profile Views / Votes Cast -->
  <text x="40" y="167" fill="#8B949E" font-family="Arial" font-size="11" font-weight="700">QUESTIONS</text>
  <text x="40" y="200" fill="#FFFFFF" font-family="Arial" font-size="28" font-weight="700">${number(questions)}</text>

  <text x="255" y="167" fill="#8B949E" font-family="Arial" font-size="11" font-weight="700">ANSWERS</text>
  <text x="255" y="200" fill="#FFFFFF" font-family="Arial" font-size="28" font-weight="700">${number(answers)}</text>

  <text x="470" y="167" fill="#8B949E" font-family="Arial" font-size="11" font-weight="700">PROFILE VIEWS</text>
  <text x="470" y="200" fill="#FFFFFF" font-family="Arial" font-size="28" font-weight="700">${profileViews === null ? "—" : number(profileViews)}</text>

  <text x="685" y="167" fill="#8B949E" font-family="Arial" font-size="11" font-weight="700">VOTES CAST</text>
  <text x="685" y="200" fill="#FFFFFF" font-family="Arial" font-size="28" font-weight="700">${votesCast === null ? "—" : number(votesCast)}</text>

  <!-- Divider -->
  <line x1="30" y1="228" x2="870" y2="228" stroke="#30363D" />

  <!-- Row 2: Badges + Recent reputation -->
  <text x="40" y="254" fill="#8B949E" font-family="Arial" font-size="11" font-weight="700">BADGES</text>

  <circle cx="47" cy="284" r="8" fill="#FFCC00" />
  <text x="65" y="289" fill="#FFFFFF" font-family="Arial" font-size="15" font-weight="600">${gold}</text>

  <circle cx="115" cy="284" r="8" fill="#B4B8BC" />
  <text x="133" y="289" fill="#FFFFFF" font-family="Arial" font-size="15" font-weight="600">${silver}</text>

  <circle cx="185" cy="284" r="8" fill="#D28C45" />
  <text x="203" y="289" fill="#FFFFFF" font-family="Arial" font-size="15" font-weight="600">${bronze}</text>

  <text x="440" y="254" fill="#8B949E" font-family="Arial" font-size="11" font-weight="700">RECENT REPUTATION</text>

  <text x="440" y="288" fill="${today >= 0 ? "#3FB950" : "#F85149"}" font-family="Arial" font-size="14" font-weight="700">
    Today ${today >= 0 ? "+" : ""}${today}
  </text>
  <text x="545" y="288" fill="${week >= 0 ? "#3FB950" : "#F85149"}" font-family="Arial" font-size="14" font-weight="700">
    7d ${week >= 0 ? "+" : ""}${week}
  </text>
  <text x="625" y="288" fill="${month >= 0 ? "#3FB950" : "#F85149"}" font-family="Arial" font-size="14" font-weight="700">
    30d ${month >= 0 ? "+" : ""}${month}
  </text>

  <!-- Divider -->
  <line x1="30" y1="330" x2="870" y2="330" stroke="#30363D" />

  <!-- Top tags -->
  <text x="40" y="352" fill="#8B949E" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700" letter-spacing="0.5">
    TOP TAGS
  </text>

  ${tagPills}

  <text x="860" y="412" text-anchor="end" fill="#6E7681" font-family="Arial, Helvetica, sans-serif" font-size="10">
    Stack Exchange API • Automatically updated
  </text>

</svg>
`;

    // =======================================================
    // RESPONSE
    // =======================================================

    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    return res.status(200).send(svg);
  } catch (error) {
    console.error(error);

    const errorSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="200" viewBox="0 0 900 200">
  <rect width="900" height="200" rx="18" fill="#0D1117" />
  <text x="450" y="80" text-anchor="middle" fill="#F85149" font-family="Arial" font-size="20" font-weight="700">
    Stack Overflow Statistics Error
  </text>
  <text x="450" y="115" text-anchor="middle" fill="#8B949E" font-family="Arial" font-size="13">
    ${escapeXml(error.message)}
  </text>
  <text x="450" y="145" text-anchor="middle" fill="#6E7681" font-family="Arial" font-size="11">
    User ID: ${escapeXml(USER_ID)}
  </text>
</svg>
`;

    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.status(200).send(errorSvg);
  }
}
