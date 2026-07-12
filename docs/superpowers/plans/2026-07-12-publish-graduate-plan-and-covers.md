# Publish Graduate Plan and Power Covers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the verified graduate planning article and unified power-electronics covers to `mortalkit1101-ui/mortalkit1101-ui.github.io` without overwriting unrelated remote work.

**Architecture:** Keep `F:\AAAAA\Blog` as the Hexo source repository and treat the GitHub Pages repository as the published static-site target. First compare histories and inspect the existing deployment workflow; then push either the source branch through the repository workflow or the generated `public` tree to the Pages branch used by the remote.

**Tech Stack:** Hexo 8.1, Butterfly 5.5.5, Node.js, Git, GitHub CLI, GitHub Pages

## Global Constraints

- Target repository is `https://github.com/mortalkit1101-ui/mortalkit1101-ui.github.io.git`.
- Preserve all unrelated remote content and history.
- Publish the article under category `规划` and tag `研究生期间规划`.
- Keep the three new power-electronics SVG covers at 1200×675.
- `npm run generate`, `npm run verify`, and `git diff --check` must pass before publication.

---

### Task 1: Connect and inspect the GitHub repository

**Files:**
- Inspect: `F:\AAAAA\Blog\.git\config`

**Interfaces:**
- Consumes: local branch `agent/unify-power-electronics-covers` at commit `a164072`
- Produces: fetched `origin/main` and a confirmed deployment strategy

- [ ] **Step 1: Configure the remote**

```powershell
git remote add origin https://github.com/mortalkit1101-ui/mortalkit1101-ui.github.io.git
```

- [ ] **Step 2: Fetch without changing the worktree**

```powershell
git fetch origin main
```

Expected: `origin/main` is available and the local worktree remains clean.

- [ ] **Step 3: Inspect history and deployment configuration**

```powershell
git log --oneline --decorate --graph --all -15
git ls-tree --name-only origin/main
git show origin/main:.github/workflows/pages.yml
```

Expected: determine whether `main` stores Hexo source or generated static files. If the workflow file does not exist, inspect `.github/workflows` and the root tree instead.

### Task 2: Authenticate and publish through the detected strategy

**Files:**
- Publish from: `F:\AAAAA\Blog\source\`
- Generated output: `F:\AAAAA\Blog\public\`

**Interfaces:**
- Consumes: deployment strategy from Task 1
- Produces: a remote branch or Pages commit containing the verified site

- [ ] **Step 1: Confirm GitHub CLI authentication**

```powershell
gh auth status
```

Expected: authenticated to `github.com` as `mortalkit1101-ui`. If not authenticated, the user completes `gh auth login` interactively.

- [ ] **Step 2: Re-run verification**

```powershell
npm run clean
npm run generate
npm run verify
git diff --check
```

Expected: Hexo generation succeeds; verification reports 22 course posts, 3 categories, 5 tags, and no missing images.

- [ ] **Step 3: Push the safe publication branch**

```powershell
git push -u origin agent/unify-power-electronics-covers
```

Expected: branch appears on GitHub without rewriting `main`.

- [ ] **Step 4: Open a draft pull request when the remote uses a source workflow**

```powershell
gh pr create --draft --base main --head agent/unify-power-electronics-covers --title "Publish graduate plan and unify power covers" --body-file "$env:TEMP\blog-pr-body.md"
```

Expected: draft PR targets `main`. If the remote stores only generated files, publish the verified `public` tree using the existing Pages deployment method instead of merging incompatible source history.

### Task 3: Verify the online deployment

**Files:**
- Verify URL: `https://041101.xyz/`
- Verify article: `https://041101.xyz/courses/power-electronics/power-electronics-career-phased-array-thesis-plan/`

**Interfaces:**
- Consumes: successful GitHub Pages deployment
- Produces: evidence that the public homepage, category, tag, article, and SVG assets render correctly

- [ ] **Step 1: Check GitHub deployment status**

```powershell
gh run list --limit 5
gh api repos/mortalkit1101-ui/mortalkit1101-ui.github.io/pages
```

Expected: latest deployment succeeds and reports the configured Pages URL.

- [ ] **Step 2: Inspect the public pages**

Open the homepage, `/categories/规划/`, `/tags/研究生期间规划/`, and the article URL in the browser.

Expected: new article appears once; category and tag each contain the article; 01–03 cards use the blue-cyan SVG covers; no broken images or overflowing tables are present.

- [ ] **Step 3: Record the published result**

Report the pushed branch/commit, PR or deployment URL, verification commands, and final public article URL.
