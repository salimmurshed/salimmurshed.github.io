/**
 * Stack Exchange API থেকে ইউজার ডাটা ফেচ করার ফাংশন
 *
 * @param {string|number} userId - Stack Overflow ইউজার আইডি
 * @param {string} [site="stackoverflow"] - সাইটের নাম (ডিফল্ট: stackoverflow)
 * @param {string} [filter="!9_bDDxJY5"] - API ফিল্টার কি (ডিফল্ট: !9_bDDxJY5)
 * @returns {Promise<Object>} ইউজার প্রোফাইল অবজেক্ট
 */
async function fetchStackOverflowUser(
  userId,
  site = "stackoverflow",
  filter = "!9_bDDxJY5",
) {
  const API_BASE_URL = "https://api.stackexchange.com/2.3";

  const url = `${API_BASE_URL}/users/${encodeURIComponent(userId)}?site=${encodeURIComponent(site)}&filter=${encodeURIComponent(filter)}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "StackOverflow-Stats-Fetcher",
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

  if (!data.items || data.items.length === 0) {
    throw new Error(`Stack Overflow user with ID "${userId}" not found`);
  }

  return data.items[0];
}
