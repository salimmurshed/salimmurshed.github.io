import fetch from "node-fetch";

/**
 * Stack Overflow User Data & Base64 Avatar Fetcher
 * @param {string|number} userId
 * @param {string} site
 * @returns {Promise<Object>}
 */
export async function getStackOverflowUser(userId, site = "stackoverflow") {
  const API = "https://api.stackexchange.com/2.3";
  // Filter !9_bDDxJY5 includes question_count, answer_count, view_count, etc.
  const filter = "!9_bDDxJY5";

  const url = `${API}/users/${encodeURIComponent(userId)}?site=${encodeURIComponent(site)}&filter=${encodeURIComponent(filter)}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`API Response Error: ${res.status}`);
  }

  const data = await res.json();

  if (data.error_id) {
    throw new Error(`API Error: ${data.error_message}`);
  }

  if (!data.items || data.items.length === 0) {
    throw new Error("User not found");
  }

  const user = data.items[0];

  // Convert Profile Image to Base64 to prevent SVG rendering breakdown
  let base64Avatar = "";
  if (user.profile_image) {
    try {
      const imgRes = await fetch(user.profile_image, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (imgRes.ok) {
        const arrayBuffer = await imgRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = imgRes.headers.get("content-type") || "image/jpeg";
        base64Avatar = `data:${mimeType};base64,${buffer.toString("base64")}`;
      }
    } catch (e) {
      console.error("Avatar conversion failed:", e.message);
    }
  }

  return {
    displayName: user.display_name || "User",
    reputation: user.reputation || 0,
    questions: user.question_count || 0,
    answers: user.answer_count || 0,
    views: user.view_count || 0,
    upVotes: user.up_vote_count || 0,
    downVotes: user.down_vote_count || 0,
    badges: {
      gold: user.badge_counts?.gold || 0,
      silver: user.badge_counts?.silver || 0,
      bronze: user.badge_counts?.bronze || 0,
    },
    avatarBase64: base64Avatar,
  };
}
