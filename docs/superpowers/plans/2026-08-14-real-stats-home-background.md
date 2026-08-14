# Real Stats and Homepage Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove hard-coded site counters, restore real Busuanzi statistics, and use the supplied image as the homepage-only background.

**Architecture:** Butterfly remains responsible for loading and rendering Busuanzi counts after the overriding site script is removed. The supplied PNG becomes an immutable Hexo source asset referenced only by `index_img`; the existing verifier is extended to block publication when fake values, stale scripts, an incorrect image, or a broken empty homepage are detected.

**Tech Stack:** Hexo 8.1.2, Butterfly 5.5.5, Node.js 24, Busuanzi, PNG, Git

## Global Constraints

- Use real Busuanzi UV/PV values; do not supply replacement or fallback counts.
- Copy the supplied PNG without changing its bytes.
- Change only the homepage top image; keep default page and footer backgrounds unchanged.
- Preserve the zero-post homepage, announcement, avatar, About page, CNAME, and repository configuration.
- Push source to `source` and generated output to `main` only after verification passes.

---

### Task 1: Extend the publication verifier

**Files:**
- Modify: `tools/verify-empty-blog-site.js`

**Interfaces:**
- Consumes: source configuration/assets and generated `public` output.
- Produces: a failing exit code for fake counters, stale override script, incorrect background bytes, or missing Busuanzi markup.

- [x] **Step 1: Add source and generated-site assertions**

Add SHA-256 support and assertions equivalent to:

```js
const crypto = require('node:crypto');
const expectedBackgroundSha256 = 'cfce96af87ea89166cd57b18bb7247d8427efdb64b49035030f3137ab3ec379b';
const sourceBackgroundPath = path.join(root, 'source', 'img', 'home-bg.png');
const publicBackgroundPath = path.join(root, 'public', 'img', 'home-bg.png');
const fixedStatsScriptPath = path.join(root, 'source', 'js', 'mortal-site-stats.js');

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

assert.equal(fs.existsSync(fixedStatsScriptPath), false);
assert.match(config, /index_img: \/img\/home-bg\.png/);
assert.doesNotMatch(config, /mortal-site-stats|7570927|10390377/);
assert.match(config, /busuanzi:\s*[\s\S]*site_uv: true[\s\S]*site_pv: true/);
assert.equal(sha256(sourceBackgroundPath), expectedBackgroundSha256);
assert.equal(sha256(publicBackgroundPath), expectedBackgroundSha256);
assert.match(index, /busuanzi_value_site_uv/);
assert.match(index, /busuanzi_value_site_pv/);
assert.match(index, /\/img\/home-bg\.png/);
assert.doesNotMatch(index, /mortal-site-stats|7570927|10390377/);
```

- [x] **Step 2: Run the strengthened verifier before implementation**

Run: `node tools/verify-empty-blog-site.js`

Expected: FAIL because the fixed stats script still exists or `home-bg.png` is missing.

### Task 2: Restore real counters and install the homepage image

**Files:**
- Delete: `source/js/mortal-site-stats.js`
- Create: `source/img/home-bg.png`
- Modify: `_config.butterfly.yml`

**Interfaces:**
- Consumes: the user-supplied PNG and Butterfly's existing Busuanzi integration.
- Produces: real asynchronous UV/PV rendering and a homepage-only image reference.

- [x] **Step 1: Copy and verify the supplied image**

Run:

```powershell
Copy-Item -LiteralPath 'D:\QQ\files\Tencent Files\2798747241\nt_qq\nt_data\Pic\2026-08\Ori\d0d4b79c4f7833e155d824d1a1e5a512.png' -Destination 'source\img\home-bg.png'
Get-FileHash -Algorithm SHA256 'D:\QQ\files\Tencent Files\2798747241\nt_qq\nt_data\Pic\2026-08\Ori\d0d4b79c4f7833e155d824d1a1e5a512.png','source\img\home-bg.png'
```

Expected: both SHA-256 hashes are identical.

- [x] **Step 2: Remove the fixed counter override**

Delete `source/js/mortal-site-stats.js` and remove this injected line:

```yaml
- <script src="/js/mortal-site-stats.js"></script>
```

- [x] **Step 3: Point the homepage to the supplied image**

Set:

```yaml
index_img: /img/home-bg.png
```

Keep:

```yaml
default_top_img: /img/mortal-bg.jpg
footer_img: /img/mortal-bg.jpg
```

- [x] **Step 4: Clean, generate, and verify**

Run:

```powershell
npm.cmd run clean
npm.cmd run generate
node tools/verify-empty-blog-site.js
```

Expected: build succeeds and verifier prints `Empty Blog homepage verification passed.`

### Task 3: Review, publish, and verify online

**Files:**
- Commit: `_config.butterfly.yml`
- Commit: deletion of `source/js/mortal-site-stats.js`
- Commit: `source/img/home-bg.png`
- Commit: `tools/verify-empty-blog-site.js`
- Commit: `docs/superpowers/plans/2026-08-14-real-stats-home-background.md`
- Publish: generated `public/**` via `tools/publish-blog.js`

**Interfaces:**
- Consumes: verified source and generated output.
- Produces: updated `origin/source`, `origin/main`, and live homepage.

- [x] **Step 1: Inspect the local homepage**

Run `npm.cmd run server -- --port 4000`, inspect `http://localhost:4000/`, and confirm the new image, zero-post card, announcement, and non-fixed statistics placeholders/rendered values.

- [ ] **Step 2: Commit and push source**

Run:

```powershell
git diff --check
git add -- _config.butterfly.yml source/js/mortal-site-stats.js source/img/home-bg.png tools/verify-empty-blog-site.js docs/superpowers/plans/2026-08-14-real-stats-home-background.md
git commit -m "Restore real stats and update homepage background"
git push origin source
```

Expected: source worktree is clean and `origin/source` advances.

- [ ] **Step 3: Publish generated site**

Run: `npm.cmd run deploy`

Expected: the generated site is committed and pushed to `origin/main`.

- [ ] **Step 4: Verify the live homepage**

Fetch `https://041101.xyz/` without cache and confirm HTTP 200, `/img/home-bg.png`, Busuanzi elements, and absence of the fixed script and fixed values.
