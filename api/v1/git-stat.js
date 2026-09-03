async function getContributionsByYear(username, startYear, endYear) {
  const token = process.env.GITHUB_TOKEN;
  const yearlyData = {};

  for (let year = startYear; year <= endYear; year++) {
    // GitHub contribution years typically run from Jan 1 to Dec 31
    const fromDate = `${year}-01-01T00:00:00Z`;
    const toDate = `${year}-12-31T23:59:59Z`;

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query($userName: String!, $from: DateTime!, $to: DateTime!) {
            user(login: $userName) {
              contributionsCollection(from: $from, to: $to) {
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
        variables: {
          userName: username,
          from: fromDate,
          to: toDate,
        },
      }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error(`Error fetching year ${year}:`, data.errors);
      continue;
    }

    yearlyData[year] =
      data.data.user.contributionsCollection.contributionCalendar;
  }

  return yearlyData; // Returns an object mapped by year, e.g., { 2023: {...}, 2024: {...} }
}
