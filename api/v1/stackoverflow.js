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
  // JSON FETCH (with basic retry, since the SE API rate-limits
  // and occasionally hiccups on serverless cold starts)
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
        // brief backoff before retrying once
        if (i < attempts - 1) {
          await new Promise((r) => setTimeout(r, 300));
        }
      }
    }

    throw lastError;
  }

  // =========================================================
  // GET USER
  //
  // Default user object already contains: reputation,
  // question_count, answer_count, badge_counts, view_count,
  // up_vote_count, down_vote_count, profile_image, display_name.
  // =========================================================

  async function getUser() {
    const url =
      `${API}/users/${encodeURIComponent(USER_ID)}` +
      `?site=${encodeURIComponent(SITE)}`;

    const data = await getJson(url);

    if (!data.items || data.items.length === 0) {
      throw new Error(`Stack Overflow user ${USER_ID} not found`);
    }

    return data.items[0];
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
  // TOP TAGS  (NEW)
  //
  // Real API data instead of scraping — reliable and won't
  // get blocked by anti-bot protection like the HTML profile
  // page does. Combines question + answer participation and
  // sorts by total posts in that tag.
  //
  // Docs: /users/{ids}/tags
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
  // STACK OVERFLOW PROFILE EXTRAS
  //
  // "People reached", "posts edited", "helpful flags" are not
  // exposed by the API at all, only on the HTML profile page.
  // That page is frequently served differently (or blocked) to
  // datacenter/serverless IPs, so treat this as best-effort only
  // — never let it silently masquerade as "0" when it actually
  // means "unknown". Everything here defaults to "—" and only
  // overwrites that default when a match is actually found.
  // =========================================================

  async function getProfileStats() {
    const result = {
      peopleReached: "—",
      postsEdited: "—",
      helpfulFlags: "—",
    };

    try {
      const profileUrl =
        `https://stackoverflow.com/users/` +
        `${encodeURIComponent(USER_ID)}` +
        `?tab=topactivity`;

      const response = await fetch(profileUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
            "AppleWebKit/537.36 (KHTML, like Gecko) " +
            "Chrome/151.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      if (!response.ok) {
        throw new Error(`Profile HTTP ${response.status}`);
      }

      const html = await response.text();

      // Bail early if we clearly got a bot-check / non-profile page
      // rather than quietly returning zeroes for everything.
      if (!/topactivity|profile|reputation/i.test(html)) {
        throw new Error("Unexpected profile page content (likely blocked)");
      }

      const plainText = html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\s+/g, " ")
        .trim();

      // PEOPLE REACHED — accepts "~149k people reached" and
      // the shorter "~149k reached" variant.
      const peopleMatch =
        plainText.match(/(~?\s*[\d,.]+\s*[KMB]?)\s+people\s+reached/i) ||
        plainText.match(/(~?\s*[\d,.]+\s*[KMB]?)\s+reached/i);

      if (peopleMatch) {
        result.peopleReached = peopleMatch[1].replace(/\s+/g, "");
      }

      // POSTS EDITED — accepts "29 posts edited" and "29 edits"
      const editedMatch =
        plainText.match(/([\d,]+)\s+posts?\s+edited/i) ||
        plainText.match(/([\d,]+)\s+edits?\b/i);

      if (editedMatch) {
        result.postsEdited = editedMatch[1];
      }

      // HELPFUL FLAGS — accepts "4 helpful flags" and "4 flags"
      const flagsMatch =
        plainText.match(/([\d,]+)\s+helpful\s+flags?/i) ||
        plainText.match(/([\d,]+)\s+flags?\b/i);

      if (flagsMatch) {
        result.helpfulFlags = flagsMatch[1];
      }
    } catch (error) {
      console.error(
        "Profile statistics (best-effort, non-fatal):",
        error.message,
      );
    }

    return result;
  }

  // =========================================================
  // MAIN
  // =========================================================

  try {
    const [user, reputationHistory, profileStats, topTags] = await Promise.all([
      getUser(),
      getReputation(),
      getProfileStats(),
      getTopTags(),
    ]);

    // =======================================================
    // REAL API COUNTS  (source of truth — never scraped)
    // =======================================================

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
    const chartX = 500;
    const chartY = 55;
    const chartWidth = 350;
    const chartHeight = 70;
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
    // TOP TAGS ROW  (NEW)
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
    const tagY = 430;
    const tagPillHeight = 30;
    const tagGap = 12;
    const tagCharWidth = 7.2; // approx width per character at font-size 13
    const tagPadding = 34; // room for text padding + count badge

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
    <text
      x="14"
      y="20"
      fill="#E6EDF3"
      font-family="Arial, Helvetica, sans-serif"
      font-size="13"
      font-weight="600"
    >${escapeXml(label)}</text>
    <text
      x="${pillWidth - 12}"
      y="20"
      text-anchor="end"
      fill="${tagColors[index % tagColors.length]}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="12"
      font-weight="700"
    >${countLabel}</text>
  </g>`;

            tagX += pillWidth + tagGap;
            return pill;
          })
          .join("")
      : `
  <text
    x="40"
    y="${tagY + 20}"
    fill="#6E7681"
    font-family="Arial, Helvetica, sans-serif"
    font-size="13"
  >No tag data available</text>`;

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
  height="490"
  viewBox="0 0 900 490"
>

  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="900" y2="490">
      <stop offset="0" stop-color="#0D1117" />
      <stop offset="1" stop-color="#171B22" />
    </linearGradient>

    <linearGradient id="accent" x1="0" y1="0" x2="900" y2="0">
      <stop offset="0" stop-color="#F48024" />
      <stop offset="1" stop-color="#FFB86B" />
    </linearGradient>

    <clipPath id="avatar">
      <circle cx="72" cy="70" r="42" />
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="900" height="490" rx="18" fill="url(#background)" />

  <!-- Orange line -->
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
  />
  `
      : ""
  }

  <!-- Name -->
  <text x="140" y="60" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700">
    ${escapeXml(user.display_name)}
  </text>

  <text x="140" y="87" fill="#F48024" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" letter-spacing="1">
    STACK OVERFLOW
  </text>

  <text x="140" y="112" fill="#8B949E" font-family="Arial, Helvetica, sans-serif" font-size="12">
    REPUTATION
  </text>

  <text x="215" y="112" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700">
    ${number(reputation)}
  </text>

  <!-- Chart -->
  <text x="500" y="30" fill="#8B949E" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700">
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

  <line x1="${chartX}" y1="${chartY + chartHeight}" x2="${chartX + chartWidth}" y2="${chartY + chartHeight}" stroke="#30363D" />

  <!-- Divider -->
  <line x1="30" y1="140" x2="870" y2="140" stroke="#30363D" />

  <!-- QUESTIONS -->
  <text x="40" y="165" fill="#8B949E" font-family="Arial" font-size="11" font-weight="700">QUESTIONS</text>
  <text x="40" y="198" fill="#FFFFFF" font-family="Arial" font-size="27" font-weight="700">${number(questions)}</text>

  <!-- ANSWERS -->
  <text x="240" y="165" fill="#8B949E" font-family="Arial" font-size="11" font-weight="700">ANSWERS</text>
  <text x="240" y="198" fill="#FFFFFF" font-family="Arial" font-size="27" font-weight="700">${number(answers)}</text>

  <!-- PROFILE VIEWS -->
  <text x="440" y="165" fill="#8B949E" font-family="Arial" font-size="11" font-weight="700">PROFILE VIEWS</text>
  <text x="440" y="198" fill="#FFFFFF" font-family="Arial" font-size="27" font-weight="700">${number(profileViews)}</text>

  <!-- PEOPLE REACHED -->
  <text x="650" y="165" fill="#8B949E" font-family="Arial" font-size="11" font-weight="700">PEOPLE REACHED</text>
  <text x="650" y="198" fill="#FFFFFF" font-family="Arial" font-size="27" font-weight="700">${escapeXml(profileStats.peopleReached)}</text>

  <!-- ROW 2 -->

  <!-- BADGES -->
  <text x="40" y="245" fill="#8B949E" font-family="Arial" font-size="11" font-weight="700">BADGES</text>
  <circle cx="47" cy="275" r="8" fill="#FFCC00" />
  <text x="65" y="280" fill="#FFFFFF" font-family="Arial" font-size="14">${gold}</text>
  <circle cx="110" cy="275" r="8" fill="#B4B8BC" />
  <text x="128" y="280" fill="#FFFFFF" font-family="Arial" font-size="14">${silver}</text>
  <circle cx="175" cy="275" r="8" fill="#D28C45" />
  <text x="193" y="280" fill="#FFFFFF" font-family="Arial" font-size="14">${bronze}</text>

  <!-- POSTS EDITED -->
  <text x="300" y="245" fill="#8B949E" font-family="Arial" font-size="11" font-weight="700">POSTS EDITED</text>
  <text x="300" y="280" fill="#FFFFFF" font-family="Arial" font-size="27" font-weight="700">${escapeXml(profileStats.postsEdited)}</text>

  <!-- HELPFUL FLAGS -->
  <text x="500" y="245" fill="#8B949E" font-family="Arial" font-size="11" font-weight="700">HELPFUL FLAGS</text>
  <text x="500" y="280" fill="#FFFFFF" font-family="Arial" font-size="27" font-weight="700">${escapeXml(profileStats.helpfulFlags)}</text>

  <!-- VOTES CAST (always real API data — never scraped/guessed) -->
  <text x="700" y="245" fill="#8B949E" font-family="Arial" font-size="11" font-weight="700">VOTES CAST</text>
  <text x="700" y="280" fill="#FFFFFF" font-family="Arial" font-size="27" font-weight="700">${number(votesCast)}</text>

  <!-- Recent reputation -->
  <line x1="30" y1="320" x2="870" y2="320" stroke="#30363D" />

  <text x="40" y="350" fill="#8B949E" font-family="Arial" font-size="11" font-weight="700">RECENT REPUTATION</text>

  <text x="40" y="378" fill="${today >= 0 ? "#3FB950" : "#F85149"}" font-family="Arial" font-size="13" font-weight="700">
    Today ${today >= 0 ? "+" : ""}${today}
  </text>
  <text x="125" y="378" fill="${week >= 0 ? "#3FB950" : "#F85149"}" font-family="Arial" font-size="13" font-weight="700">
    7d ${week >= 0 ? "+" : ""}${week}
  </text>
  <text x="190" y="378" fill="${month >= 0 ? "#3FB950" : "#F85149"}" font-family="Arial" font-size="13" font-weight="700">
    30d ${month >= 0 ? "+" : ""}${month}
  </text>

  <text x="500" y="378" fill="#6E7681" font-family="Arial, Helvetica, sans-serif" font-size="11">
    Stack Exchange API • Automatically updated
  </text>

  <!-- Top Tags -->
  <line x1="30" y1="400" x2="870" y2="400" stroke="#30363D" />

  <text x="40" y="422" fill="#8B949E" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700">
    TOP TAGS
  </text>

  ${tagPills}

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
