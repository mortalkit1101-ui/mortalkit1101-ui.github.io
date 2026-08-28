# Publish Normalization and Fix Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 只发布《05 Normalization（归一化）》并让上一篇指向较小编号、下一篇指向较大编号。

**Architecture:** 使用 Hexo 的文章发布标记与现有白名单限制发布范围，使用 Butterfly 原生 `post_pagination: 2` 修正全站文章导航。源码提交在基于最新 `origin/source` 的隔离检出中完成，避免把主工作区的其他草稿带入提交；生成站点通过现有安全脚本发布到 `main`。

**Tech Stack:** Hexo 8、Butterfly 5.5.5、Node.js、Git、GitHub Pages

## Global Constraints

- 只新增并发布 `05 Normalization（归一化）`，不提交 `06` 及之后的草稿。
- 不强制推送，不覆盖主工作区的无关改动。
- 图片必须同时存在于 Hexo 静态目录与 Obsidian 镜像目录，且内容一致。
- 上一篇编号减小，下一篇编号增大。

---

### Task 1: 修改发布状态与导航配置

**Files:**
- Modify: `source/_posts/blog/大模型llm/05 Normalzation（归一化）.md`
- Modify: `_config.yml`
- Modify: `_config.butterfly.yml`
- Create: `scripts/published-post-whitelist.js`
- Create: `source/img/blog/llm/05-normalization/01-batchnorm-sequence-padding.png`
- Create: `source/_posts/blog/img/blog/llm/05-normalization/01-batchnorm-sequence-padding.png`

**Interfaces:**
- Consumes: Hexo Front Matter、`published_posts` 白名单、Butterfly `post_pagination`。
- Produces: 仅新增 05 的可发布源码和方向正确的文章导航。

- [ ] **Step 1: 更新文章与白名单**

将文章的 `published: false` 改为 `published: true`，并在 `_config.yml` 的 `published_posts` 末尾加入：

```yaml
  - blog/大模型llm/05 Normalzation（归一化）.md
```

- [ ] **Step 2: 更新导航方向**

将 `_config.butterfly.yml` 修改为：

```yaml
post_pagination: 2
```

- [ ] **Step 3: 验证图片和发布范围**

比较两个 `01-batchnorm-sequence-padding.png` 的 SHA-256，并确认白名单只包含 01 至 05。

### Task 2: 生成并验证站点

**Files:**
- Generated: `public/**`

**Interfaces:**
- Consumes: Task 1 的文章、配置与图片。
- Produces: 已验证的静态网站。

- [ ] **Step 1: 清理并生成**

运行：

```powershell
npm.cmd run clean
npm.cmd run generate
```

预期：命令退出码均为 0，归档显示 5 篇文章。

- [ ] **Step 2: 检查文章与图片**

确认 05 生成页面包含标题、MathJax 配置和 `/img/blog/llm/05-normalization/01-batchnorm-sequence-padding.png`，且生成图片与源图片哈希一致。

- [ ] **Step 3: 检查导航**

确认 04 页面显示“下一篇 05”，05 页面显示“上一篇 04”，且 05 不显示下一篇。

### Task 3: 隔离提交并发布 GitHub

**Files:**
- Commit: Task 1 文件及本次设计、计划文档
- Publish: `public/**` through `tools/publish-blog.js`

**Interfaces:**
- Consumes: 已验证源码与静态输出。
- Produces: 远端 `source` 源码提交和 `main` Pages 部署提交。

- [ ] **Step 1: 基于最新远端创建隔离检出**

获取 `origin/source`，在工作区内创建临时 worktree，只复制 Task 1 和说明文档列出的文件。

- [ ] **Step 2: 检查隔离提交范围**

运行 `git status --short` 和 `git diff --cached --name-only`，确认没有 06 及之后文章或其他无关文件。

- [ ] **Step 3: 提交并推送 source**

创建普通提交并运行：

```powershell
git push origin HEAD:source
```

预期：推送成功且不使用 `--force`。

- [ ] **Step 4: 发布 main**

运行：

```powershell
npm.cmd run deploy
```

预期：安全发布脚本创建或确认最新 `main` 部署提交并正常推送。

- [ ] **Step 5: 在线验证**

访问 `https://041101.xyz` 的文章、图片和相邻文章链接，确认状态正常、正文图片可见、导航方向正确。


