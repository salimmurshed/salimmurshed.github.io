async function getContributions(username) {
  const token = process.env.GITHUB_TOKEN;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query($userName: String!) {
          user(login: $userName) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                    color
                  }
                }
              }
            }
          }
        }
      `,
      variables: { userName: username },
    }),
  });

  const data = await response.json();
  return data.data.user.contributionsCollection.contributionCalendar;
}
