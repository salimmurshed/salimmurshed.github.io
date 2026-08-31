import zlib from "zlib";

export default async function handler(req, res) {
  const USER_ID = String(req.query.id || "9202118");
  const SITE = String(req.query.site || "stackoverflow");

  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  const escapeXml = (str) =>
    String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  async function fetchApi(endpoint) {
    const response = await fetch(endpoint, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Encoding": "gzip, deflate",
      },
    });

    if (!response.ok) {
      throw new Error(`API HTTP ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    let decompressed;
    try {
      decompressed = zlib.gunzipSync(buffer).toString("utf-8");
    } catch {
      decompressed = buffer.toString("utf-8");
    }

    return JSON.parse(decompressed);
  }

  try {
    // 1. Fetch User Data
    const userUrl = `https://api.stackexchange.com/2.3/users/${encodeURIComponent(USER_ID)}?site=${encodeURIComponent(SITE)}`;
    const userData = await fetchApi(userUrl);

    if (!userData.items || userData.items.length === 0) {
      throw new Error(`User ID ${USER_ID} not found`);
    }

    const user = userData.items[0];
    const name = user.display_name || "User";
    const questionCount = user.question_count || 0;
    const answerCount = user.answer_count || 0;

    // 2. Fetch Recent Answers with Question Details
    const answersUrl = `https://api.stackexchange.com/2.3/users/${encodeURIComponent(USER_ID)}/answers?site=${encodeURIComponent(SITE)}&page=1&pagesize=5&order=desc&sort=creation&filter=withbody`;
    const answersData = await fetchApi(answersUrl);
    const recentAnswers = answersData.items || [];

    // 3. Render List
    let answersListSvg = "";
    if (recentAnswers.length > 0) {
      answersListSvg = recentAnswers
        .map((ans, idx) => {
          const yPos = 185 + idx * 28;
          let rawTitle = ans.title || `Answer to Question #${ans.question_id}`;
          if (rawTitle.length > 65) {
            rawTitle = rawTitle.substring(0, 62) + "...";
          }
          const title = escapeXml(rawTitle);
          const score = ans.score >= 0 ? `+${ans.score}` : `${ans.score}`;

          return `
            <g transform="translate(40, ${yPos})">
              <circle cx="5" cy="-5" r="3" fill="#F48024"/>
              <text x="20" y="0" fill="#E6EDF3" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif" font-size="13">${title}</text>
              <text x="820" y="0" text-anchor="end" fill="#58A6FF" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif" font-size="12" font-weight="bold">Score: ${score}</text>
            </g>
          `;
        })
        .join("");
    } else {
      answersListSvg = `
        <text x="40" y="195" fill="#8B949E" font-family="sans-serif" font-size="13">No recent answers found.</text>
      `;
    }

    const cardHeight = Math.max(220, 160 + (recentAnswers.length || 1) * 32);

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="${cardHeight}" viewBox="0 0 900 ${cardHeight}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="900" y2="${cardHeight}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0D1117"/>
      <stop offset="100%" stop-color="#161B22"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="900" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F48024"/>
      <stop offset="100%" stop-color="#FFB86B"/>
    </linearGradient>
  </defs>

  <rect width="900" height="${cardHeight}" rx="12" fill="url(#bg)" stroke="#30363D" stroke-width="1"/>
  <rect width="900" height="4" rx="2" fill="url(#accent)"/>

  <text x="40" y="45" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif" font-size="22" font-weight="bold">${escapeXml(name)}</text>
  <text x="40" y="68" fill="#F48024" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="1">STACK OVERFLOW CONTRIBUTIONS</text>

  <g transform="translate(600, 35)">
    <rect x="0" y="0" width="120" height="42" rx="6" fill="#21262D" stroke="#30363D"/>
    <text x="60" y="18" text-anchor="middle" fill="#8B949E" font-family="sans-serif" font-size="10" font-weight="700">QUESTIONS</text>
    <text x="60" y="36" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="15" font-weight="bold">${questionCount}</text>
  </g>

  <g transform="translate(735, 35)">
    <rect x="0" y="0" width="125" height="42" rx="6" fill="#21262D" stroke="#30363D"/>
    <text x="62" y="18" text-anchor="middle" fill="#8B949E" font-family="sans-serif" font-size="10" font-weight="700">ANSWERS</text>
    <text x="62" y="36" text-anchor="middle" fill="#3FB950" font-family="sans-serif" font-size="15" font-weight="bold">${answerCount}</text>
  </g>

  <line x1="40" y1="100" x2="860" y2="100" stroke="#30363D" stroke-width="1"/>

  <text x="40" y="130" fill="#8B949E" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="0.5">RECENT ANSWER TITLES</text>

  ${answersListSvg}
</svg>
`;

    return res.status(200).send(svg);
  } catch (err) {
    const errorSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="100" viewBox="0 0 600 100">
  <rect width="600" height="100" rx="8" fill="#0D1117" stroke="#F85149" stroke-width="1"/>
  <text x="300" y="45" text-anchor="middle" fill="#F85149" font-family="sans-serif" font-size="14" font-weight="bold">Error Fetching Data</text>
  <text x="300" y="70" text-anchor="middle" fill="#8B949E" font-family="sans-serif" font-size="12">${escapeXml(err.message)}</text>
</svg>
`;
    return res.status(200).send(errorSvg);
  }
}
