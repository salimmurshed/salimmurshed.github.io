async function getProfileStats() {
  const result = {
    peopleReached: "—",
    postsEdited: "—",
    helpfulFlags: "—",
    votesCast: "—",
  };

  try {
    // IMPORTANT:
    // Cache-busting query parameter prevents Stack Overflow/CDN
    // from returning an old profile HTML response.
    const cacheBust = Date.now();

    const profileUrl =
      `https://stackoverflow.com/users/${encodeURIComponent(USER_ID)}` +
      `?tab=topactivity&_=${cacheBust}`;

    const response = await fetch(profileUrl, {
      method: "GET",

      cache: "no-store",

      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/151.0.0.0 Safari/537.36",

        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",

        "Accept-Language": "en-US,en;q=0.9",

        "Cache-Control": "no-cache, no-store, max-age=0",

        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`Profile HTTP ${response.status}`);
    }

    const html = await response.text();

    // -------------------------------------------------------
    // Convert HTML to plain text
    // -------------------------------------------------------

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

    console.log("PROFILE URL:", profileUrl);

    console.log("PROFILE TEXT LENGTH:", plainText.length);

    // -------------------------------------------------------
    // PEOPLE REACHED
    //
    // Current profile:
    //
    // ~149k
    // people reached
    //
    // -------------------------------------------------------

    const peopleMatch = plainText.match(
      /(~?\s*[\d,.]+\s*[KMB]?)\s+people\s+reached/i,
    );

    if (peopleMatch) {
      result.peopleReached = peopleMatch[1].replace(/\s+/g, "");
    }

    // -------------------------------------------------------
    // POSTS EDITED
    //
    // Current:
    //
    // 29 posts edited
    //
    // -------------------------------------------------------

    const editedMatch = plainText.match(/([\d,]+)\s+posts?\s+edited/i);

    if (editedMatch) {
      result.postsEdited = editedMatch[1];
    }

    // -------------------------------------------------------
    // HELPFUL FLAGS
    //
    // Current:
    //
    // 4 helpful flags
    //
    // -------------------------------------------------------

    const flagsMatch = plainText.match(/([\d,]+)\s+helpful\s+flags?/i);

    if (flagsMatch) {
      result.helpfulFlags = flagsMatch[1];
    }

    // -------------------------------------------------------
    // VOTES CAST
    //
    // Current:
    //
    // 205 votes cast
    //
    // -------------------------------------------------------

    const votesMatch = plainText.match(/([\d,]+)\s+votes\s+cast/i);

    if (votesMatch) {
      result.votesCast = votesMatch[1];
    }

    console.log("PROFILE STATS:", JSON.stringify(result));
  } catch (error) {
    console.error("Profile statistics:", error.message);
  }

  return result;
}
