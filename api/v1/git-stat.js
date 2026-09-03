/**
 * Fetches GitHub contribution data year-by-year using the GraphQL API,
 * incorporating private contributions via GITHUB_TOKEN.
 */
async function fetchContributionsByYear(username, startYear, endYear) {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error(
      "GITHUB_TOKEN is not defined in the environment variables.",
    );
  }

  const yearlyData = {};

  for (let year = startYear; year <= endYear; year++) {
    const fromDate = `${year}-01-01T00:00:00Z`;
    const toDate = `${year}-12-31T23:59:59Z`;

    try {
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
        console.error(`GitHub API Error for year ${year}:`, data.errors);
        continue;
      }

      yearlyData[year] =
        data.data.user.contributionsCollection.contributionCalendar;
    } catch (error) {
      console.error(`Network or parsing error for year ${year}:`, error);
    }
  }

  return yearlyData;
}

/**
 * Renders the multi-year contribution calendars into a target DOM container.
 */
async function renderGitHubContributions(
  username,
  startYear,
  endYear,
  containerId,
) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "<p>Loading contributions (public & private)...</p>";

  const contributionsByYear = await fetchContributionsByYear(
    username,
    startYear,
    endYear,
  );

  container.innerHTML = ""; // Clear loader

  Object.entries(contributionsByYear).forEach(([year, calendar]) => {
    const yearWrapper = document.createElement("div");
    yearWrapper.style.marginBottom = "20px";

    const heading = document.createElement("h3");
    heading.innerText = `${year}: ${calendar.totalContributions} contributions`;
    yearWrapper.appendChild(heading);

    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridAutoFlow = "column";
    grid.style.gridGap = "3px";
    grid.style.overflowX = "auto";
    grid.style.paddingBottom = "10px";

    calendar.weeks.forEach((week) => {
      const col = document.createElement("div");
      col.style.display = "grid";
      col.style.gridAutoRows = "10px";
      col.style.gridGap = "3px";

      week.contributionDays.forEach((day) => {
        const cell = document.createElement("div");
        cell.style.width = "10px";
        cell.style.height = "10px";
        cell.style.backgroundColor = day.color;
        cell.style.borderRadius = "2px";
        cell.title = `${day.date}: ${day.contributionCount} contributions`;
        col.appendChild(cell);
      });

      grid.appendChild(col);
    });

    yearWrapper.appendChild(grid);
    container.appendChild(yearWrapper);
  });
}
