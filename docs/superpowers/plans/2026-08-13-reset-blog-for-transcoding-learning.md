# Blog Content Reset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all existing published notes and course images while preserving the Blog framework, then reposition the announcement around learning transcoding from zero.

**Architecture:** Treat Hexo source content and course-specific media as the only removable units. Keep theme, site configuration, general images, static pages, tooling, and repository history intact; validate the reset through filesystem assertions and a clean Hexo build.

**Tech Stack:** Hexo 8, Butterfly theme, Markdown, YAML, Node.js/npm, Git

## Global Constraints

- Delete all 29 Markdown notes currently under `source/_posts`.
- Delete the complete `source/img/courses` image tree.
- Preserve Blog framework files, `source/img/avatar.JPG`, `source/img/mortal-bg.jpg`, static pages, domain configuration, and publishing tools.
- Set the announcement text exactly to `记录从 0 开始的转码学习`.
- Do not remove historical documents under `docs/superpowers`.

---

### Task 1: Remove legacy learning content

**Files:**
- Delete: `source/_posts/**`
- Delete: `source/img/courses/**`

**Interfaces:**
- Consumes: Hexo's `source/_posts` content convention and course image paths.
- Produces: An empty post source and no course-specific image tree.

- [x] **Step 1: Verify the destructive targets**

Run:

```powershell
(Resolve-Path source/_posts).Path
(Resolve-Path source/img/courses).Path
(rg --files source/_posts | Measure-Object).Count
```

Expected: both resolved paths are below the repository's `source` directory and the post count is `29`.

- [x] **Step 2: Delete the confirmed content**

Run:

```powershell
Remove-Item -LiteralPath (Resolve-Path source/_posts) -Recurse -Force
Remove-Item -LiteralPath (Resolve-Path source/img/courses) -Recurse -Force
New-Item -ItemType Directory -Path source/_posts | Out-Null
```

Expected: `source/_posts` exists and is empty; `source/img/courses` does not exist.

- [x] **Step 3: Verify retained general images**

Run:

```powershell
Test-Path source/img/avatar.JPG
Test-Path source/img/mortal-bg.jpg
```

Expected: both commands output `True`.

### Task 2: Reposition the announcement

**Files:**
- Modify: `_config.butterfly.yml:302`

**Interfaces:**
- Consumes: Butterfly `aside.card_announcement.content` configuration.
- Produces: The exact user-facing announcement `记录从 0 开始的转码学习`.

- [x] **Step 1: Update the announcement value**

Replace:

```yaml
content: 记录电源硬件、数字电源与微波工程学习笔记
```

with:

```yaml
content: 记录从 0 开始的转码学习
```

- [x] **Step 2: Verify the configured copy**

Run:

```powershell
rg -n "记录从 0 开始的转码学习|记录电源硬件、数字电源与微波工程学习笔记" _config.butterfly.yml
```

Expected: one match for the new text and no match for the old text.

### Task 3: Validate and publish

**Files:**
- Verify: `source/_posts`
- Verify: `source/img`
- Verify: generated `public/`

**Interfaces:**
- Consumes: npm scripts in `package.json` and the configured Git remote.
- Produces: A successful clean build, one intentional commit, and the pushed current branch.

- [x] **Step 1: Build from a clean generated state**

Run:

```powershell
npm run clean
npm run generate
```

Expected: Hexo exits successfully and reports `0 files generated` for posts while still generating static site pages.

- [x] **Step 2: Verify old post output is absent**

Run:

```powershell
rg -n "Python 基础|微波工程与工程电磁场|电源硬件与数字电源" public
```

Expected: no matches.

- [ ] **Step 3: Review and commit the exact scope**

Run:

```powershell
git status --short
git diff --check
git add -A -- source/_posts source/img/courses _config.butterfly.yml docs/superpowers/plans/2026-08-13-reset-blog-for-transcoding-learning.md
git commit -m "Reset blog for transcoding learning"
```

Expected: the commit contains only legacy note/image deletion, announcement copy, and this plan.

- [ ] **Step 4: Push the current branch**

Run:

```powershell
git push -u origin (git branch --show-current)
```

Expected: the remote accepts the commit and configures upstream tracking.
