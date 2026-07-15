# Source/Main Blog Publishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a repeatable Hexo source-to-main publishing workflow and publish the Python basics series to the live blog.

**Architecture:** The remote `source` branch stores Hexo source and becomes the repository default branch. Hexo Git deployment builds the site and commits generated output to the existing unrelated `main` history used by GitHub Pages.

**Tech Stack:** Git, GitHub CLI, Hexo 8, `hexo-deployer-git`, npm, Butterfly theme, in-app browser verification

## Global Constraints

- Never merge the unrelated `source` and `main` histories.
- Never force-push either branch during routine publication.
- Preserve `source/CNAME` with `041101.xyz` and `source/.nojekyll`.
- Use the authenticated `mortalkit` account for routine pushes.
- Stop before deployment when generation fails.

---

### Task 1: Establish the Source Branch

**Files:**
- Modify: Git branch and remote metadata only

**Interfaces:**
- Consumes: current source commit history at `HEAD`
- Produces: local and remote `source` tracking branch

- [ ] **Step 1: Confirm repository state**

Run: `git status -sb && git log -1 --oneline && git branch -vv`

Expected: clean source worktree except for this plan file, with Python commit `b6c9cd8` in history.

- [ ] **Step 2: Create and publish the source branch**

Run: `git switch -c source && git push -u origin source`

Expected: remote `source` is created without rewriting `main`.

- [ ] **Step 3: Set the GitHub default branch**

Run: `gh repo edit mortalkit1101-ui/mortalkit1101-ui.github.io --default-branch source`

Expected: repository metadata reports `source` as `defaultBranchRef.name`.

### Task 2: Configure Hexo Deployment

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `_config.yml`

**Interfaces:**
- Consumes: Hexo-generated `public/` directory
- Produces: `npm run publish` and Hexo deployment to remote `main`

- [ ] **Step 1: Install the deployment adapter**

Run: `npm.cmd install --save-dev hexo-deployer-git`

Expected: dependency is added to `devDependencies` and the lockfile resolves successfully.

- [ ] **Step 2: Add the publish script and deployment target**

Add this script to `package.json`:

```json
"publish": "hexo clean && hexo generate && hexo deploy"
```

Add this configuration to `_config.yml`:

```yaml
deploy:
  type: git
  repo: https://github.com/mortalkit1101-ui/mortalkit1101-ui.github.io.git
  branch: main
  message: "Deploy blog: {{ now('YYYY-MM-DD HH:mm:ss') }}"
```

- [ ] **Step 3: Validate generation before deployment**

Run: `npm.cmd run generate`

Expected: Hexo reports successful generation of the six `/python-basics/` routes.

- [ ] **Step 4: Commit and push source configuration**

Run: `git add package.json package-lock.json _config.yml docs/superpowers/plans/2026-07-15-source-main-publishing.md && git commit -m "Configure Hexo publishing workflow" && git push`

Expected: source configuration is present on remote `source`.

### Task 3: Publish Python Basics

**Files:**
- Deploy: generated `public/` tree to remote `main`

**Interfaces:**
- Consumes: committed `source` branch and successful Hexo build
- Produces: updated live static site on `main`

- [ ] **Step 1: Deploy generated site**

Run: `npm.cmd run publish`

Expected: `hexo-deployer-git` fetches the existing `main` history, creates a normal deployment commit, and pushes without `--force`.

- [ ] **Step 2: Confirm remote branch state**

Run: `git fetch origin main && git log -1 --oneline origin/main`

Expected: `origin/main` contains a new deployment commit.

### Task 4: Verify the Live Blog

**Files:**
- No repository file changes

**Interfaces:**
- Consumes: `https://041101.xyz`
- Produces: evidence that the deployment and responsive layout are healthy

- [ ] **Step 1: Verify publication routes**

Check the homepage and all six `/python-basics/` URLs.

Expected: each page loads with the expected Chinese title, and the homepage/category counts include Python.

- [ ] **Step 2: Verify desktop rendering**

Inspect at the default desktop viewport.

Expected: no mojibake, broken images, page-level horizontal overflow, or site-breaking console errors.

- [ ] **Step 3: Verify mobile rendering**

Inspect the homepage, Python index, and one code-heavy Python article at 390 by 844 pixels.

Expected: content fits the viewport, code blocks remain contained or internally scrollable, and navigation remains usable.

- [ ] **Step 4: Confirm future publication readiness**

Run: `git status -sb && git branch -vv && gh auth status`

Expected: clean local `source` tracking `origin/source`, with `mortalkit` active and `push: true` repository permission.
