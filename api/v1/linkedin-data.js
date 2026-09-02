export default async function handler(req, res) {
  const userId = String(req.query.userId || "");

  const users = {
    "salim-murshed": {
      username: "salim-murshed",

      impressions: 3,

      followers: 954,
      followersGrowth: "0%",

      profileViewers: 5,

      searchAppearances: 4,
      searchGrowth: "0%",
    },
  };

  const user = users[userId];

  if (!user) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  return res.status(200).json(user);
}
