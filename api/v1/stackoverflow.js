export default async function handler(req, res) {
  const USER_ID = String(req.query.id || "9202118");
  const SITE = String(req.query.site || "stackoverflow");

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
      const number = Number(value || 0);

      if (number >= 1000000) {
        return `${(number / 1000000).toFixed(1)}M`;
      }

      if (number >= 1000) {
        return `${Math.round(number / 1000)}K`;
      }

      return String(number);
    };

    const fetchJson = async (url) => {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 StackOverflowStats/1.0",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return response.json();
    };

    // =========================================================
    // 1. STACK EXCHANGE USER API
    // =========================================================

    const userData = await fetchJson(
      `https://api.stackexchange.com/2.3/users/${encodeURIComponent(
        USER_ID,
      )}?site=${encodeURIComponent(SITE)}&filter=!6VvPDZ8F2`,
    );

    if (!userData.items?.length) {
      throw new Error("Stack Overflow user not found");
    }

    const user = userData.items[0];

    // =========================================================
    // BASIC PROFILE
    // =========================================================

    const name = user.display_name || "Stack Overflow User";

    const reputation = Number(user.reputation || 0);

    const profileImage = user.profile_image || "";

    const questionCount = Number(user.question_count || 0);

    const answerCount = Number(user.answer_count || 0);

    const profileViews = Number(user.view_count || 0);

    const gold = Number(user.badge_counts?.gold || 0);

    const silver = Number(user.badge_counts?.silver || 0);

    const bronze = Number(user.badge_counts?.bronze || 0);

    // =========================================================
    // 2. FETCH ACTUAL STACK OVERFLOW PROFILE PAGE
    // =========================================================

    let peopleReached = null;
    let postsEdited = null;
    let helpfulFlags = null;
    let votesCast = null;

    const profileUrl = `https://stackoverflow.com/users/${encodeURIComponent(
      USER_ID,
    )}?tab=topactivity`;

    try {
      const profileResponse = await fetch(profileUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/151.0 Safari/537.36",

          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",

          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      if (profileResponse.ok) {
        const html = await profileResponse.text();

        // =====================================================
        // PEOPLE REACHED
        //
        // Example:
        //
        // ~149k
        // people reached
        // =====================================================

        const peopleMatch = html.match(
          /~\s*([0-9,.]+)\s*([kKmMbB]?)\s*<\/div>\s*<div[^>]*>\s*people reached/i,
        );

        if (peopleMatch) {
          const number = peopleMatch[1];

          const suffix = peopleMatch[2] || "";

          peopleReached = `${number}${suffix}`;
        }

        // =====================================================
        // FALLBACK PEOPLE REACHED REGEX
        // =====================================================

        if (!peopleReached) {
          const text = html
            .replace(/<script[\s\S]*?<\/script>/gi, " ")
            .replace(/<style[\s\S]*?<\/style>/gi, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ");

          const match = text.match(
            /~\s*([0-9,.]+)\s*([kKmMbB]?)\s+people reached/i,
          );

          if (match) {
            peopleReached = `${match[1]}${match[2] || ""}`;
          }
        }

        // =====================================================
        // POSTS EDITED
        //
        // Example:
        //
        // 29 posts edited
        // =====================================================

        const postsEditedMatch = html.match(/(\d[\d,]*)\s*posts?\s*edited/i);

        if (postsEditedMatch) {
          postsEdited = Number(postsEditedMatch[1].replace(/,/g, ""));
        }

        // =====================================================
        // HELPFUL FLAGS
        //
        // Example:
        //
        // 4
        // helpful flags
        // =====================================================

        const helpfulFlagsMatch = html.match(/(\d[\d,]*)\s*helpful\s*flags/i);

        if (helpfulFlagsMatch) {
          helpfulFlags = Number(helpfulFlagsMatch[1].replace(/,/g, ""));
        }

        // =====================================================
        // VOTES CAST
        //
        // Example:
        //
        // 205
        // votes cast
        // =====================================================

        const votesCastMatch = html.match(/(\d[\d,]*)\s*votes\s*cast/i);

        if (votesCastMatch) {
          votesCast = Number(votesCastMatch[1].replace(/,/g, ""));
        }
      }
    } catch (profileError) {
      console.error("Profile scraping failed:", profileError.message);
    }

    // =========================================================
    // 3. FALLBACK VALUES
    //
    // Do NOT show fake zero for unavailable scraped values.
    // =========================================================

    if (peopleReached === null) {
      peopleReached = "N/A";
    }

    if (postsEdited === null) {
      postsEdited = "N/A";
    }

    if (helpfulFlags === null) {
      helpfulFlags = "N/A";
    }

    if (votesCast === null) {
      votesCast = "N/A";
    }

    // =========================================================
    // 4. REPUTATION HISTORY
    // =========================================================

    const reputationData = await fetchJson(
      `https://api.stackexchange.com/2.3/users/${USER_ID}/reputation-history?site=${SITE}&pagesize=100`,
    );

    const history = reputationData.items || [];

    // =========================================================
    // 5. RECENT REPUTATION
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
    // 6. 30 DAY CHART
    // =========================================================

    const daily = {};

    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);

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
    // 7. CHART
    // =========================================================

    const chartX = 500;

    const chartY = 85;

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
    // 8. SVG
    // =========================================================

    const svg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="900"
  height="400"
  viewBox="0 0 900 400"
>

<defs>

  <linearGradient
    id="background"
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
    id="accent"
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


  <clipPath id="avatarClip">
    <circle
      cx="70"
      cy="70"
      r="42"
    />
  </clipPath>

</defs>


<!-- ====================================================== -->
<!-- BACKGROUND -->
<!-- ====================================================== -->

<rect
  width="900"
  height="400"
  rx="18"
  fill="url(#background)"
/>


<!-- ====================================================== -->
<!-- TOP ACCENT -->
<!-- ====================================================== -->

<rect
  width="900"
  height="5"
  rx="3"
  fill="url(#accent)"
/>


<!-- ====================================================== -->
<!-- PROFILE IMAGE -->
<!-- ====================================================== -->

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


<!-- ====================================================== -->
<!-- NAME -->
<!-- ====================================================== -->

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


<!-- ====================================================== -->
<!-- CHART -->
<!-- ====================================================== -->

<text
  x="500"
  y="50"
  fill="#8B949E"
  font-family="Arial, Helvetica, sans-serif"
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


<!-- ====================================================== -->
<!-- DIVIDER -->
<!-- ====================================================== -->

<line
  x1="30"
  y1="140"
  x2="870"
  y2="140"
  stroke="#30363D"
/>


<!-- ====================================================== -->
<!-- BASIC STATS -->
<!-- ====================================================== -->

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
  y="198"
  fill="#FFFFFF"
  font-family="Arial"
  font-size="25"
  font-weight="700"
>
  ${formatNumber(questionCount)}
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
  y="198"
  fill="#FFFFFF"
  font-family="Arial"
  font-size="25"
  font-weight="700"
>
  ${formatNumber(answerCount)}
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
  y="198"
  fill="#FFFFFF"
  font-family="Arial"
  font-size="25"
  font-weight="700"
>
  ${shortNumber(profileViews)}
</text>


<!-- ====================================================== -->
<!-- BADGES -->
<!-- ====================================================== -->

<text
  x="450"
  y="170"
  fill="#8B949E"
  font-family="Arial"
  font-size="11"
  font-weight="600"
>
  BADGES
</text>


<circle
  cx="458"
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
  x="534"
  y="196"
  fill="#FFFFFF"
  font-family="Arial"
  font-size="13"
>
  ${silver}
</text>


<circle
  cx="582"
  cy="191"
  r="6"
  fill="#D28C45"
/>


<text
  x="596"
  y="196"
  fill="#FFFFFF"
  font-family="Arial"
  font-size="13"
>
  ${bronze}
</text>


<!-- ====================================================== -->
<!-- IMPACT -->
<!-- ====================================================== -->

<text
  x="40"
  y="240"
  fill="#F48024"
  font-family="Arial"
  font-size="13"
  font-weight="700"
  letter-spacing="1"
>
  IMPACT
</text>


<!-- PEOPLE REACHED -->

<text
  x="40"
  y="265"
  fill="#8B949E"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  PEOPLE REACHED
</text>


<text
  x="40"
  y="293"
  fill="#FFFFFF"
  font-family="Arial"
  font-size="25"
  font-weight="700"
>
  ${escapeXml(peopleReached)}
</text>


<!-- POSTS EDITED -->

<text
  x="235"
  y="265"
  fill="#8B949E"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  POSTS EDITED
</text>


<text
  x="235"
  y="293"
  fill="#FFFFFF"
  font-family="Arial"
  font-size="25"
  font-weight="700"
>
  ${escapeXml(postsEdited)}
</text>


<!-- HELPFUL FLAGS -->

<text
  x="410"
  y="265"
  fill="#8B949E"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  HELPFUL FLAGS
</text>


<text
  x="410"
  y="293"
  fill="#FFFFFF"
  font-family="Arial"
  font-size="25"
  font-weight="700"
>
  ${escapeXml(helpfulFlags)}
</text>


<!-- VOTES CAST -->

<text
  x="585"
  y="265"
  fill="#8B949E"
  font-family="Arial"
  font-size="10"
  font-weight="600"
>
  VOTES CAST
</text>


<text
  x="585"
  y="293"
  fill="#FFFFFF"
  font-family="Arial"
  font-size="25"
  font-weight="700"
>
  ${escapeXml(votesCast)}
</text>


<!-- ====================================================== -->
<!-- RECENT REPUTATION -->
<!-- ====================================================== -->

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
  y="373"
  fill="${today >= 0 ? "#3FB950" : "#F85149"}"
  font-family="Arial"
  font-size="12"
  font-weight="700"
>
  Today ${today >= 0 ? "+" : ""}${today}
</text>


<text
  x="125"
  y="373"
  fill="${week >= 0 ? "#3FB950" : "#F85149"}"
  font-family="Arial"
  font-size="12"
  font-weight="700"
>
  7d ${week >= 0 ? "+" : ""}${week}
</text>


<text
  x="185"
  y="373"
  fill="${month >= 0 ? "#3FB950" : "#F85149"}"
  font-family="Arial"
  font-size="12"
  font-weight="700"
>
  30d ${month >= 0 ? "+" : ""}${month}
</text>


<text
  x="500"
  y="373"
  fill="#6E7681"
  font-family="Arial"
  font-size="10"
>
  Live Stack Overflow profile statistics
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
  y="85"
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
  y="120"
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
