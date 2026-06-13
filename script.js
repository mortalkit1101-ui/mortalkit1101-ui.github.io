const contributionGrids = document.querySelectorAll(".contribution-grid");
const activeNavLinks = document.querySelectorAll(".nav-links a");
const themeToggle = document.querySelector("#themeToggle");
const copyEmailButton = document.querySelector("[data-copy-email]");
const searchButtons = document.querySelectorAll(".nav-actions button:first-child");
const randomButtons = document.querySelectorAll(".nav-actions button:nth-child(2)");
const githubUser = "mortalkit1101-ui";
const contributionApi = `https://github-contributions-api.jogruber.de/v4/${githubUser}?y=last`;

const articles = [
  { title: "Python 基础", url: "posts/python-basics.html", tags: ["python基础"] },
];

function resolveArticleUrl(url) {
  const prefix = window.location.pathname.includes("/posts/") ? "../" : "./";
  return `${prefix}${url}`;
}

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
      `过去一年 GitHub 贡献 <strong>${total}</strong> 次，累计活跃 <strong>${activeDays}</strong> 天`
    );
  } catch (error) {
    updateContributionSummary("暂时无法获取 <strong>GitHub</strong> 活跃度，请稍后刷新。");
  }
}

function createSearchDialog() {
  const dialog = document.createElement("div");
  dialog.className = "search-dialog";
  dialog.hidden = true;
  dialog.innerHTML = `
    <div class="search-backdrop" data-search-close></div>
    <section class="glass-card search-panel" role="dialog" aria-modal="true" aria-labelledby="search-title">
      <div class="search-head">
        <div>
          <p class="eyebrow">Search</p>
          <h2 id="search-title">搜索文章</h2>
        </div>
        <button class="search-close" type="button" data-search-close aria-label="关闭搜索">×</button>
      </div>
      <label class="search-box">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m21 21-4.3-4.3m1.3-5.2a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
        </svg>
        <input type="search" placeholder="输入标题关键词..." autocomplete="off" data-search-input />
      </label>
      <div class="search-results" data-search-results>
        <p class="search-empty">输入关键词后，会搜索标题中包含它的文章。</p>
      </div>
    </section>
  `;

  document.body.appendChild(dialog);
  return dialog;
}

const searchDialog = createSearchDialog();
const searchInput = searchDialog.querySelector("[data-search-input]");
const searchResults = searchDialog.querySelector("[data-search-results]");

function renderSearchResults(keyword) {
  const query = keyword.trim().toLowerCase();

  if (!query) {
    searchResults.innerHTML = '<p class="search-empty">输入关键词后，会搜索标题中包含它的文章。</p>';
    return;
  }

  const matched = articles.filter((article) => article.title.toLowerCase().includes(query));

  if (!matched.length) {
    searchResults.innerHTML = `<p class="search-empty">没有找到标题包含「${keyword}」的文章。</p>`;
    return;
  }

  searchResults.innerHTML = matched
    .map(
      (article) => `
        <a class="search-result-item" href="${resolveArticleUrl(article.url)}">
          <span>${article.title}</span>
          <small>${(article.tags || []).join(" · ")}</small>
        </a>
      `
    )
    .join("");
}

function openSearch() {
  searchDialog.hidden = false;
  document.body.classList.add("search-open");
  searchInput.value = "";
  renderSearchResults("");
  window.setTimeout(() => searchInput.focus(), 0);
}

function closeSearch() {
  searchDialog.hidden = true;
  document.body.classList.remove("search-open");
}

function showToast(message) {
  const oldToast = document.querySelector(".toast-message");
  oldToast?.remove();

  const toast = document.createElement("div");
  toast.className = "glass-card toast-message";
  toast.textContent = message;
  document.body.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add("is-leaving");
  }, 1800);

  window.setTimeout(() => {
    toast.remove();
  }, 2200);
}

function openRandomArticle(button) {
  button?.classList.add("is-spinning");
  window.setTimeout(() => button?.classList.remove("is-spinning"), 450);

  if (!articles.length) {
    showToast("文章还在路上，先等等它长出来~");
    return;
  }

  const article = articles[Math.floor(Math.random() * articles.length)];
  window.location.href = resolveArticleUrl(article.url);
}

loadGitHubContributions();
setInterval(loadGitHubContributions, 1000 * 60 * 60 * 6);

searchButtons.forEach((button) => {
  button.addEventListener("click", openSearch);
});

randomButtons.forEach((button) => {
  button.addEventListener("click", () => openRandomArticle(button));
});

searchDialog.querySelectorAll("[data-search-close]").forEach((button) => {
  button.addEventListener("click", closeSearch);
});

searchInput.addEventListener("input", (event) => {
  renderSearchResults(event.target.value);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !searchDialog.hidden) closeSearch();

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openSearch();
  }
});

activeNavLinks.forEach((link) => {
  link.addEventListener("click", () => {
    activeNavLinks.forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});

themeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

copyEmailButton?.addEventListener("click", async () => {
  const email = copyEmailButton.dataset.copyEmail;

  try {
    await navigator.clipboard.writeText(email);
    copyEmailButton.textContent = "邮箱已复制";
  } catch (error) {
    copyEmailButton.textContent = email;
  }

  window.setTimeout(() => {
    copyEmailButton.textContent = email;
  }, 1800);
});
