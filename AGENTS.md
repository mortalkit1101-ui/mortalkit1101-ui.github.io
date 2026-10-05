# 博客写作与发布约定

## 用户工作方式

- 用户将 `source` 文件夹作为 Obsidian 仓库，在其中编写文章。博客文章存放于 `source/_posts/blog/`，图片优先存放于 `source/img/`。
- 用户后续要求整理并发布文章时，完成结构优化、展示验证及 GitHub 推送；授权范围内直接完成发布，不重复询问是否推送。
- 告知未来写作安排本身不代表立即发布所有现有文件。仅整理和公开用户指定的文章，保持其他未发布笔记原状态。

## 文章处理

- 保留原意和技术结论，优化标题、章节层级、段落衔接、代码块、表格与公式排版。
- 检查 Obsidian 的 `[[双链]]`、`![[嵌入]]`、图片路径和公式是否能被当前 Hexo 渲染。针对实际文章处理不兼容引用，保证图片与站内链接在生成页面可用，并尽量保持 Obsidian 中可阅读和编辑。
- 编辑旧文章时保留原文件路径和 `date`，除非用户要求改网址。维护分类、标签和 `toc_number`，避免手写标题编号与自动目录编号重复。
- `scripts/published-post-whitelist.js` 会隐藏未在 `_config.yml` 的 `published_posts` 名单中的 `blog` 文章。新增或明确发布文章时同步维护此名单；仅设置 `published: true` 不够。
- `.obsidian/`、`.trash/` 和本地运行环境不提交。用户的笔记正文仍保存在源码分支中；保持未指定文章的公开状态不变。

## 检查与发布

- 当前源码分支为 `source`，生成网页发布到 `main`；保持两个分支的独立历史，使用普通推送。
- 保留 `source/CNAME` 的 `041101.xyz` 和 `source/.nojekyll`。
- 本地便携环境在 `.local`；`tools/blog.ps1` 准备 Git、Node 和现有系统代理，入口为 `preview.cmd`、`new-article.cmd`、`check.cmd`、`publish.cmd`、`login.cmd` 和 `blog-shell.cmd`。
- 发布前生成网站，运行 `npm run verify:site`；涉及旧文章分类或目录约定时运行 `npm run verify:blog`。原 `npm run verify` 对应历史课程集合，不用于当前博客。
- 实际查看受影响的文章页面，确认标题层级、目录、图片、公式、代码、表格与页面布局。不要只以构建成功作为展示正常的证据。
- `npm run publish` 提交并推送源码，再部署生成网页；`npm run publish:check` 仅演练，不上传。该发布入口会提交所有未忽略的修改，发布前检查改动范围，不混入无关用户改动。
- 发布后检查 GitHub Pages 部署结果，并查看线上受影响页面。遇到构建、登录或部署失败时保留文章和本地改动，清楚说明实际阻塞，不宣称已发布。
