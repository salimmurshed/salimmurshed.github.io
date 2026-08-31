async function getProfileStats() {
  const result = {
    peopleReached: "—",
    postsEdited: "—",
    helpfulFlags: "—",
    votesCast: "—",
  };

  try {
    const profileUrl = `https://stackoverflow.com/users/${encodeURIComponent(USER_ID)}?tab=topactivity`;

    const response = await fetch(profileUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/151.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      throw new Error(`Profile HTTP ${response.status}`);
    }

    const html = await response.text();

    // Find Impact heading
    const impactStart = html.search(/<h3[^>]*>\s*Impact\s*<\/h3>/i);

    if (impactStart === -1) {
      throw new Error("Impact section not found");
    }

    // Impact section is immediately after the heading.
    const impactHtml = html.slice(impactStart, impactStart + 15000);

    console.log("IMPACT HTML:", impactHtml);

    // Convert HTML → plain text
    const impactText = impactHtml
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s+/g, " ")
      .trim();

    console.log("IMPACT TEXT:", impactText);

    // -----------------------------------------------------
    // PEOPLE REACHED
    // Actual Stack Overflow text:
    // "~149k people reached"
    // -----------------------------------------------------

    const peopleMatch = impactText.match(
      /(~?\s*[\d,.]+\s*[KMB]?)\s+people\s+reached/i,
    );

    if (peopleMatch) {
      result.peopleReached = peopleMatch[1].replace(/\s+/g, "").trim();
    }

    // -----------------------------------------------------
    // POSTS EDITED
    // Actual text:
    // "29 posts edited"
    // -----------------------------------------------------

    const postsMatch = impactText.match(/([\d,]+)\s+posts?\s+edited/i);

    if (postsMatch) {
      result.postsEdited = postsMatch[1];
    }

    // -----------------------------------------------------
    // HELPFUL FLAGS
    // Actual text:
    // "4 helpful flags"
    // -----------------------------------------------------

    const flagsMatch = impactText.match(/([\d,]+)\s+helpful\s+flags?/i);

    if (flagsMatch) {
      result.helpfulFlags = flagsMatch[1];
    }

    // -----------------------------------------------------
    // VOTES CAST
    // Actual text:
    // "205 votes cast"
    // -----------------------------------------------------

    const votesMatch = impactText.match(/([\d,]+)\s+votes\s+cast/i);

    if (votesMatch) {
      result.votesCast = votesMatch[1];
    }

    console.log("FINAL PROFILE STATS:", result);
  } catch (error) {
    console.error("Profile statistics:", error);
  }

  return result;
}
