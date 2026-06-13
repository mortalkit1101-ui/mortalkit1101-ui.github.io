const contributionGrids = document.querySelectorAll(".contribution-grid");
const activeNavLinks = document.querySelectorAll(".nav-links a");
const themeToggle = document.querySelector("#themeToggle");
const githubUser = "mortalkit1101-ui";
const contributionApi = `https://github-contributions-api.jogruber.de/v4/${githubUser}?y=last`;

function renderContributionGrid(contributions = []) {
  contributionGrids.forEach((grid) => {
    grid.innerHTML = "";

    contributions.forEach((item) => {
      const day = document.createElement("span");
      day.className = "day";
      day.dataset.level = String(item.level ?? 0);
      day.title = `${item.date}: ${item.count ?? 0} contributions`;
      grid.appendChild(day);
    });
  });
}

function renderEmptyContributionGrid() {
  contributionGrids.forEach((grid) => {
    grid.innerHTML = "";

    for (let index = 0; index < 371; index += 1) {
      const day = document.createElement("span");
      day.className = "day";
      day.dataset.level = "0";
      grid.appendChild(day);
    }
  });
}

function updateContributionSummary(text) {
  document.querySelectorAll(".activity-summary p").forEach((summary) => {
    summary.innerHTML = text;
  });
}

async function loadGitHubContributions() {
  if (!contributionGrids.length) return;

  renderEmptyContributionGrid();
  updateContributionSummary("正在同步 <strong>GitHub</strong> 活跃度...");

  try {
    const response = await fetch(contributionApi, { cache: "no-store" });
    if (!response.ok) throw new Error("GitHub contribution request failed");

    const data = await response.json();
    const contributions = Array.isArray(data.contributions) ? data.contributions : [];
    if (!contributions.length) throw new Error("GitHub contribution data is empty");

    renderContributionGrid(contributions);

    const total =
      typeof data.total?.lastYear === "number"
        ? data.total.lastYear
        : contributions.reduce((sum, item) => sum + (item.count || 0), 0);
    const activeDays = contributions.filter((item) => (item.count || 0) > 0).length;

    updateContributionSummary(
      `过去一年 GitHub 贡献 <strong>${total}</strong> 次，累计活跃 <strong>${activeDays}</strong> 天，数据来自 <strong>@${githubUser}</strong>`
    );
  } catch (error) {
    updateContributionSummary("暂时无法获取 <strong>GitHub</strong> 活跃度，请稍后刷新。");
  }
}

loadGitHubContributions();
setInterval(loadGitHubContributions, 1000 * 60 * 60 * 6);

activeNavLinks.forEach((link) => {
  link.addEventListener("click", () => {
    activeNavLinks.forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});

themeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});
