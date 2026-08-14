# Fix Article TOC Numbering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove duplicate numbering from the PyTorch article's table of contents while preserving its handwritten heading numbers.

**Architecture:** Use Butterfly's existing per-page `toc_number` override in the target article Front Matter. Extend the existing blog verifier so the source metadata and generated TOC structure are both checked without changing the global theme configuration.

**Tech Stack:** Hexo 8.1.2, Butterfly 5.5.5, Markdown/YAML Front Matter, Node.js assertions

## Global Constraints

- Keep the handwritten `1`, `1.1`, `1.2`, `1.3`, `1.4`, and `1.5` heading numbers.
- Apply the automatic-numbering override only to the target article.
- Do not modify `_config.butterfly.yml` or global TOC styling.
- Verify the generated site before publishing `source` and `main`.

---

### Task 1: Add a regression check for the article TOC

**Files:**
- Modify: `tools/verify-blog-categories.js`
- Test: `tools/verify-blog-categories.js`

**Interfaces:**
- Consumes: target article Markdown and its generated `public/.../index.html`.
- Produces: a failing assertion until the article declares `toc_number: false`, followed by generated-HTML assertions that reject automatic TOC number spans.

- [ ] **Step 1: Add source and generated-output assertions**

Add constants for the target source and generated article, then assert:

```js
const articleSource = fs.readFileSync(articleSourcePath, 'utf8');
assert.match(articleSource, /^toc_number: false$/m);

const articleHtml = fs.readFileSync(articleOutputPath, 'utf8');
assert(!articleHtml.includes('<span class="toc-number">'));
assert(articleHtml.includes('<span class="toc-text">1.1 数据准备</span>'));
```

- [ ] **Step 2: Run the verifier and confirm the new check fails**

Run: `npm.cmd run verify:blog`

Expected: FAIL because the current article Front Matter does not contain `toc_number: false`.

### Task 2: Disable automatic numbering for the target article

**Files:**
- Modify: `source/_posts/blog/大模型llm/01 从数据生成到模型保存的完整二分类流程.md`

**Interfaces:**
- Consumes: Butterfly's supported `page.toc_number` boolean override.
- Produces: article metadata that disables generated TOC numbers only for this article.

- [ ] **Step 1: Add the per-article override**

Add this field to the YAML Front Matter before the closing delimiter:

```yaml
toc_number: false
```

- [ ] **Step 2: Clean and regenerate the site**

Run: `npm.cmd run clean`

Expected: Hexo deletes the database and `public` directory successfully.

Run: `npm.cmd run generate`

Expected: Hexo generates the article and other pages without errors.

- [ ] **Step 3: Run the regression verifier**

Run: `npm.cmd run verify:blog`

Expected: `Blog category verification passed.`

- [ ] **Step 4: Check the rendered article**

Start Hexo locally and inspect the article at desktop and mobile widths. Confirm the TOC contains `1.1 数据准备`, contains no `.toc-number` elements, has no broken images or horizontal overflow, and reports no console errors.

- [ ] **Step 5: Commit the implementation**

```powershell
git add -- tools/verify-blog-categories.js "source/_posts/blog/大模型llm/01 从数据生成到模型保存的完整二分类流程.md" docs/superpowers/plans/2026-08-14-fix-article-toc-numbering.md
git commit -m "Fix article TOC numbering"
```

### Task 3: Publish and verify GitHub Pages

**Files:**
- Generated deployment output: `.deploy_pages/`

**Interfaces:**
- Consumes: verified `public/` output from Task 2.
- Produces: synchronized GitHub `source` and `main` branches and a corrected live article.

- [ ] **Step 1: Push the source branch**

Run: `git push origin source`

Expected: `source` advances to the implementation commit.

- [ ] **Step 2: Deploy the generated site**

Run: `npm.cmd run deploy`

Expected: the publishing script creates a normal deployment commit and pushes `main` without force-pushing.

- [ ] **Step 3: Verify production**

Check the live article HTML and browser rendering. Confirm it returns HTTP 200, includes `toc_number`-free markup with `1.1 数据准备`, contains no `<span class="toc-number">`, and has no broken images, overflow, or console errors.
