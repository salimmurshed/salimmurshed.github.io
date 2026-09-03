export default async function handler(req, res) {
  const username = "salimmurshed";
  const year = req.query.year || 2024;
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    return res.end(
      "Error: GITHUB_TOKEN environment variable is not set on Vercel.",
    );
  }

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
          from: `${year}-01-01T00:00:00Z`,
          to: `${year}-12-31T23:59:59Z`,
        },
      }),
    });

    const json = await response.json();
    const calendar =
      json.data?.user?.contributionsCollection?.contributionCalendar;

    if (!calendar) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain");
      return res.end(
        "Could not fetch contribution calendar from GitHub. Check your username or token.",
      );
    }

    let weeksHtml = "";
    calendar.weeks.forEach((week) => {
      let daysHtml = "";
      week.contributionDays.forEach((day) => {
        daysHtml += `<div class="cell" style="background-color: ${day.color};" title="${day.date}: ${day.contributionCount} contributions"></div>`;
      });
      weeksHtml += `<div class="column">${daysHtml}</div>`;
    });

    const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>GitHub Contributions - ${year}</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0d1117; color: #c9d1d9; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .card { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 20px; }
            h3 { margin-top: 0; font-size: 14px; color: #8b949e; }
            .grid { display: grid; grid-auto-flow: column; grid-gap: 3px; overflow-x: auto; }
            .column { display: grid; grid-auto-rows: 10px; grid-gap: 3px; }
            .cell { width: 10px; height: 10px; border-radius: 2px; }
        </style>
    </head>
    <body>
        <div class="card">
            <h3>${calendar.totalContributions} contributions in ${year} (Public & Private)</h3>
            <div class="grid">${weeksHtml}</div>
        </div>
    </body>
    </html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.statusCode = 200;
    return res.end(html);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    return res.end(`Server Error: ${err.message}`);
  }
}
