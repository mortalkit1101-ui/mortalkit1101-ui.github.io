# LLM Category Publishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the polished PyTorch article with one extensible `大模型 LLM` sidebar category and date-descending category pages.

**Architecture:** A pure category rule module owns alias normalization, while a Hexo `before_generate` filter applies it to post-category relations. The native Butterfly category card renders the normalized taxonomy, and a repository verification script checks aliases, links, counts, dates, and generated ordering before publication.

**Tech Stack:** Hexo 8, Node.js CommonJS, Butterfly 5.5.5, Markdown

## Global Constraints

- Display one canonical category named `大模型 LLM`.
- Treat `大模型`, `LLM`, and `大模型 LLM` as aliases for that canonical category and deduplicate matches.
- Preserve unrelated categories.
- Sort every category page by Front Matter `date` from newest to oldest.
- Use the existing non-force source-to-main publishing workflow.
- Do not publish Obsidian workspace state.

---

### Task 1: Add category verification

**Files:**
- Create: `tools/category-rules.js`
- Create: `tools/verify-blog-categories.js`
- Modify: `package.json`

**Interfaces:**
- Produces: `normalizeCategoryNames(categories: unknown[]): string[]`
- Produces: `npm run verify:blog`

- [ ] **Step 1: Add pure normalization rules**

```js
'use strict';

const CANONICAL_LLM_CATEGORY = '大模型 LLM';
const LLM_CATEGORY_ALIASES = new Set(['大模型', 'LLM', CANONICAL_LLM_CATEGORY]);

function normalizeCategoryNames(categories) {
  const names = categories.flat(Infinity)
    .map(category => String(category).trim())
    .filter(Boolean);
  const hasLlmCategory = names.some(name => LLM_CATEGORY_ALIASES.has(name));
  const normalized = names.filter(name => !LLM_CATEGORY_ALIASES.has(name));
  if (hasLlmCategory) normalized.unshift(CANONICAL_LLM_CATEGORY);
  return [...new Set(normalized)];
}

module.exports = {
  CANONICAL_LLM_CATEGORY,
  LLM_CATEGORY_ALIASES,
  normalizeCategoryNames,
};
```

- [ ] **Step 2: Add generated-site assertions**

```js
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  CANONICAL_LLM_CATEGORY,
  normalizeCategoryNames,
} = require('./category-rules');

const root = path.resolve(__dirname, '..');
const postsRoot = path.join(root, 'source', '_posts');
const publicRoot = path.join(root, 'public');

function markdownFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.name === '.obsidian') return [];
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(target);
    return entry.isFile() && entry.name.endsWith('.md') ? [target] : [];
  });
}

assert.deepEqual(normalizeCategoryNames(['大模型']), [CANONICAL_LLM_CATEGORY]);
assert.deepEqual(normalizeCategoryNames(['LLM']), [CANONICAL_LLM_CATEGORY]);
assert.deepEqual(
  normalizeCategoryNames(['大模型', 'LLM', 'Python']),
  [CANONICAL_LLM_CATEGORY, 'Python'],
);

for (const file of markdownFiles(postsRoot)) {
  const markdown = fs.readFileSync(file, 'utf8');
  const frontMatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert(frontMatter, `Missing Front Matter: ${file}`);
  const date = frontMatter[1].match(/^date:\s*(.+)$/m);
  assert(date && !Number.isNaN(Date.parse(date[1].trim())), `Invalid date: ${file}`);
}

const homepage = fs.readFileSync(path.join(publicRoot, 'index.html'), 'utf8');
const card = homepage.match(/<div class="card-widget card-categories">([\s\S]*?)<div class="card-widget card-tags">/);
assert(card, 'Missing homepage category card');
const names = [...card[1].matchAll(/card-category-list-name">([^<]+)</g)].map(match => match[1]);
assert.equal(names.filter(name => name === CANONICAL_LLM_CATEGORY).length, 1);
assert(!names.includes('大模型') && !names.includes('LLM'), 'Legacy LLM categories remain visible');

const link = card[1].match(new RegExp(`href="([^"]+)"><span class="card-category-list-name">${CANONICAL_LLM_CATEGORY}</span>`));
assert(link, 'Missing canonical category link');
const segments = decodeURIComponent(link[1]).split('/').filter(Boolean);
const categoryFile = path.join(publicRoot, ...segments, 'index.html');
assert(fs.existsSync(categoryFile), `Missing category page: ${categoryFile}`);
const categoryHtml = fs.readFileSync(categoryFile, 'utf8');
const dates = [...categoryHtml.matchAll(/class="post-meta-date-created" datetime="([^"]+)"/g)]
  .map(match => Date.parse(match[1]));
assert(dates.length > 0, 'Category page has no articles');
assert(dates.every((date, index) => index === 0 || dates[index - 1] >= date), 'Category dates are not descending');

console.log('Blog category verification passed.');
```

- [ ] **Step 3: Register the verification command**

```json
"verify:blog": "node tools/verify-blog-categories.js"
```

- [ ] **Step 4: Run verification before implementation**

Run: `npm.cmd run verify:blog`

Expected: FAIL because the generated homepage still exposes `大模型` and `LLM` as separate nested categories.

### Task 2: Normalize categories and ordering

**Files:**
- Create: `scripts/normalize-post-categories.js`
- Modify: `_config.yml`
- Modify: `source/_posts/blog/大模型llm/01 从数据生成到模型保存的完整二分类流程.md`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: `normalizeCategoryNames()` from `tools/category-rules.js`
- Produces: normalized Hexo post-category relations before generators run

- [ ] **Step 1: Register the Hexo filter**

```js
'use strict';

const { normalizeCategoryNames } = require('../tools/category-rules');

hexo.extend.filter.register('before_generate', async function normalizePostCategories() {
  const posts = this.model('Post').find({ published: true }).toArray();
  for (const post of posts) {
    const current = post.categories.toArray().map(category => category.name);
    const normalized = normalizeCategoryNames(current);
    if (current.join('\0') !== normalized.join('\0')) {
      await post.setCategories(normalized);
    }
  }
}, 20);
```

- [ ] **Step 2: Set date-descending category order**

```yaml
category_generator:
  per_page: 0
  order_by: -date
```

- [ ] **Step 3: Canonicalize the current article**

```yaml
categories:
  - 大模型 LLM
```

- [ ] **Step 4: Ignore Obsidian state**

Append `.obsidian/` to `.gitignore` so vault settings are not staged with posts.

- [ ] **Step 5: Rebuild and verify**

Run: `npm.cmd run clean`, `npm.cmd run generate`, and `npm.cmd run verify:blog`.

Expected: all commands exit `0`; the homepage card contains one `大模型 LLM` entry and its category page is date-descending.

### Task 3: Review, commit, and publish

**Files:**
- Commit only the article, category implementation, verification, configuration, `.gitignore`, and approved docs.
- Preserve unrelated working-tree changes.

**Interfaces:**
- Produces: updated `origin/source` and generated static content on `origin/main`

- [ ] **Step 1: Inspect the exact staged scope**

Run `git status -sb`, `git diff --check`, and `git diff --cached --stat`.

Expected: no Obsidian files and no unrelated deletion are staged.

- [ ] **Step 2: Commit and push source**

Commit with `Publish PyTorch article and LLM category`, then push the current `source` branch normally.

- [ ] **Step 3: Publish generated pages**

Run the repository publishing workflow, which updates the unrelated `main` history without merging or force-pushing.

- [ ] **Step 4: Verify production**

Open `https://041101.xyz`, the `大模型 LLM` category link, and the article at desktop and mobile widths. Confirm the article, card, count, order, images, and navigation render correctly.
