# Unified Site Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Use the existing homepage image for every default page banner and footer, then remove the obsolete circuit-board image.

**Architecture:** Butterfly remains responsible for banner selection. Its active `index_img`, `default_top_img`, and `footer_img` settings all point to one source asset, while the existing blog verifier prevents old references or files from returning.

**Tech Stack:** Hexo 8, Butterfly 5.5.5, Node.js CommonJS

## Global Constraints

- Use `/img/home-bg.png` for the homepage, default page banners, and footer.
- Delete `source/img/mortal-bg.jpg`.
- Keep historical design documents unchanged.
- Publish source and generated site with normal, non-force pushes.

---

### Task 1: Add failing background assertions

**Files:**
- Modify: `tools/verify-blog-categories.js`

**Interfaces:**
- Consumes: `_config.butterfly.yml`, `source/img`, and generated `public`
- Produces: a failing `npm run verify:blog` result for any active `mortal-bg.jpg` reference or file

- [ ] **Step 1: Add runtime tree collection**

```js
function filesUnder(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(target) : [target];
  });
}
```

- [ ] **Step 2: Assert unified configuration and removed asset**

```js
const themeConfig = fs.readFileSync(path.join(root, '_config.butterfly.yml'), 'utf8');
for (const key of ['default_top_img', 'index_img', 'footer_img']) {
  assert.match(themeConfig, new RegExp(`^${key}: /img/home-bg\\.png$`, 'm'));
}
assert.equal(fs.existsSync(path.join(root, 'source', 'img', 'mortal-bg.jpg')), false);
assert.equal(fs.existsSync(path.join(publicRoot, 'img', 'mortal-bg.jpg')), false);
for (const file of filesUnder(publicRoot).filter(file => /\.(?:html|css|js|xml)$/.test(file))) {
  assert(!fs.readFileSync(file, 'utf8').includes('/img/mortal-bg.jpg'), `Legacy background reference: ${file}`);
}
```

- [ ] **Step 3: Confirm the test fails before implementation**

Run: `npm.cmd run verify:blog`

Expected: FAIL because the active config and source tree still contain `mortal-bg.jpg`.

### Task 2: Unify configuration and remove the old image

**Files:**
- Modify: `_config.butterfly.yml`
- Delete: `source/img/mortal-bg.jpg`

**Interfaces:**
- Produces: all default Butterfly banners and the footer using `/img/home-bg.png`

- [ ] **Step 1: Update active settings**

```yaml
default_top_img: /img/home-bg.png
index_img: /img/home-bg.png
footer_img: /img/home-bg.png
```

- [ ] **Step 2: Delete the obsolete asset**

Delete only `F:\AAAAA\Blog\source\img\mortal-bg.jpg` after verifying that its resolved path is inside `F:\AAAAA\Blog\source\img`.

- [ ] **Step 3: Rebuild and verify**

Run `npm.cmd run clean`, `npm.cmd run generate`, and `npm.cmd run verify:blog`.

Expected: all commands exit `0`, `public/img/home-bg.png` exists, and `public/img/mortal-bg.jpg` does not exist.

### Task 3: Visual validation and publication

**Files:**
- Commit the config, verifier, image deletion, plan, and approved design only.

**Interfaces:**
- Produces: synchronized `origin/source`, generated `origin/main`, and a verified live site

- [ ] **Step 1: Inspect desktop and mobile pages**

Check the homepage, article, category, tags, archives, and about pages for `/img/home-bg.png`, broken images, horizontal overflow, and console errors at desktop and 390px widths.

- [ ] **Step 2: Commit and push source**

Commit with `Unify site backgrounds`, then push `source` normally.

- [ ] **Step 3: Publish generated pages**

Run `npm.cmd run deploy` to update the independent `main` branch without merging or force-pushing.

- [ ] **Step 4: Verify production**

Confirm `https://041101.xyz` and the principal page types use `home-bg.png` and load without broken images or layout overflow.
