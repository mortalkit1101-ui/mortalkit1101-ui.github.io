# Empty Blog Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a valid Butterfly homepage with “暂无文章” when the Blog has zero posts, use the exact new announcement copy, and publish the verified result to GitHub Pages.

**Architecture:** A root Hexo generator supplies `index.html` only when the official index generator has no posts to paginate. Site-owned JS and CSS are injected into Butterfly to render the empty state without modifying the theme submodule; a Node verifier gates source and generated-site publication.

**Tech Stack:** Hexo 8.1.2, Butterfly 5.5.5, Node.js 24, Pug, Stylus, Git

## Global Constraints

- Keep all legacy notes and `source/img/courses` deleted.
- Preserve the existing Butterfly homepage and sidebar structure.
- Display `暂无文章` only when the post collection is empty.
- Set announcement content exactly to `从 0 开始的转码学习`.
- Do not restore placeholder posts or alter avatar, background, About, CNAME, or repository configuration.
- Publish source files to `source` and generated files to `main` only after all assertions pass.

---

### Task 1: Add a failing empty-site verifier

**Files:**
- Create: `tools/verify-empty-blog-site.js`

**Interfaces:**
- Consumes: `source/_posts`, `source/img/courses`, `_config.butterfly.yml`, and generated `public/index.html`.
- Produces: exit code `0` only when the empty Blog source and generated homepage satisfy the approved design.

- [x] **Step 1: Create the verifier**

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const postsDir = path.join(root, 'source', '_posts');
const courseImagesDir = path.join(root, 'source', 'img', 'courses');
const configPath = path.join(root, '_config.butterfly.yml');
const indexPath = path.join(root, 'public', 'index.html');

function filesBelow(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(target) : [target];
  });
}

assert.equal(filesBelow(postsDir).length, 0, 'source/_posts must be empty');
assert.equal(fs.existsSync(courseImagesDir), false, 'course images must remain deleted');

const config = fs.readFileSync(configPath, 'utf8');
assert.match(config, /content: 从 0 开始的转码学习/);
assert.doesNotMatch(config, /记录从 0 开始的转码学习/);

assert.equal(fs.existsSync(indexPath), true, 'public/index.html must exist');
const index = fs.readFileSync(indexPath, 'utf8');
assert.match(index, /暂无文章/);
assert.match(index, /从 0 开始的转码学习/);
assert.doesNotMatch(index, /文本词频统计项目实战|微波工程与工程电磁场|电源硬件与数字电源/);

console.log('Empty Blog homepage verification passed.');
```

- [x] **Step 2: Run the verifier before implementation**

Run: `node tools/verify-empty-blog-site.js`

Expected: FAIL with `public/index.html must exist`.

### Task 2: Generate and render the empty homepage

**Files:**
- Create: `scripts/empty-home.js`
- Create: `source/js/empty-home.js`
- Create: `source/css/empty-home.css`
- Modify: `_config.butterfly.yml`

**Interfaces:**
- Consumes: Hexo `locals.posts` and the empty Butterfly `.recent-post-items` container.
- Produces: root `index.html` recognized as the true homepage, with a theme-native empty-state card inserted at runtime.

- [x] **Step 1: Add the zero-post generator**

```js
'use strict';

hexo.extend.generator.register('empty-home', function emptyHome(locals) {
  if (locals.posts.length !== 0) return [];

  return {
    path: 'index.html',
    layout: ['index', 'archive'],
    data: {
      __index: true,
      type: false,
      posts: locals.posts,
      current: 1,
      total: 1,
      prev: 0,
      next: 0,
      base: '',
      prev_link: '',
      next_link: '',
    },
  };
});
```

- [x] **Step 2: Add the site-owned empty-state script**

```js
(() => {
  const renderEmptyHome = () => {
    const isHomepage = window.location.pathname === '/'
      || window.location.pathname === '/index.html';
    if (!isHomepage) return;
    const postList = document.querySelector(
      '#recent-posts .recent-post-items',
    );
    if (!postList || postList.children.length !== 0) return;
    const emptyState = document.createElement('div');
    emptyState.className = 'recent-post-empty';
    emptyState.textContent = '暂无文章';
    postList.append(emptyState);
  };
  document.addEventListener('DOMContentLoaded', renderEmptyHome);
  document.addEventListener('pjax:complete', renderEmptyHome);
  renderEmptyHome();
})();
```

- [x] **Step 3: Add theme-native site styling**

```css
#recent-posts .recent-post-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  min-height: 16.8em;
  border-radius: 8px;
  background: var(--card-bg);
  box-shadow: var(--card-box-shadow);
  color: var(--font-color);
  font-size: 1.25em;
  transition: all 0.3s;
}
```

- [x] **Step 4: Set the exact announcement**

```yaml
content: 从 0 开始的转码学习
```

- [x] **Step 5: Clean, generate, and rerun the verifier**

Run:

```powershell
npm.cmd run clean
npm.cmd run generate
node tools/verify-empty-blog-site.js
```

Expected: Hexo generates `index.html`; verifier prints `Empty Blog homepage verification passed.`

### Task 3: Commit source and publish generated site

**Files:**
- Commit: `_config.butterfly.yml`
- Commit: `scripts/empty-home.js`
- Commit: `source/js/empty-home.js`
- Commit: `source/css/empty-home.css`
- Commit: `tools/verify-empty-blog-site.js`
- Commit: `docs/superpowers/plans/2026-08-14-empty-blog-homepage.md`
- Publish: generated `public/**` through `tools/publish-blog.js`

**Interfaces:**
- Consumes: verified source tree and `public` build.
- Produces: synchronized `origin/source` and deployed GitHub Pages `origin/main`.

- [ ] **Step 1: Review and commit source scope**

Run:

```powershell
git diff --check
git status --short
git add -- _config.butterfly.yml scripts/empty-home.js source/js/empty-home.js source/css/empty-home.css tools/verify-empty-blog-site.js docs/superpowers/specs/2026-08-14-empty-blog-homepage-design.md docs/superpowers/plans/2026-08-14-empty-blog-homepage.md
git commit -m "Add empty blog homepage"
```

Expected: one source commit containing only the approved empty homepage implementation, test, announcement, and plan.

- [ ] **Step 2: Push the source branch**

Run: `git push origin source`

Expected: `origin/source` advances to the new source commit.

- [ ] **Step 3: Publish the generated site**

Run: `npm.cmd run deploy`

Expected: `tools/publish-blog.js` commits the clean generated tree and pushes `main` with a normal Git push.

- [ ] **Step 4: Verify remote branch heads**

Run:

```powershell
git ls-remote origin refs/heads/source refs/heads/main
git status -sb
```

Expected: both remote branch hashes are returned and the source worktree is clean.
