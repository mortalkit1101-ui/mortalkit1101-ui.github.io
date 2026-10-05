# Mortal 博客本地写作

此文件夹已拉取博客完整 Git 历史，当前使用 `source` 分支。
仓库：https://github.com/mortalkit1101-ui/mortalkit1101-ui.github.io
网站：https://041101.xyz

## 日常使用

1. 双击 **preview.cmd**，在浏览器打开 http://127.0.0.1:4000 。预览会在后台运行，保存 Markdown 后刷新页面查看修改；双击 **stop-preview.cmd** 可停止预览。
2. 修改旧文章：用 Markdown 编辑器打开 **source/_posts/blog** 中的 `.md` 文件。按当前写作约定，将 **source** 整个文件夹作为 Obsidian 仓库打开；VS Code 等编辑器也可以直接打开整个 Blog 文件夹。
3. 新建文章：双击 **new-article.cmd**，输入标题和分类。工具创建带日期、分类、公式支持的文章，并自动加入 `_config.yml` 的 `published_posts` 名单。按输出路径打开文件写作。
4. 首次使用双击 **login.cmd**，在 GitHub 页面完成登录并检查推送权限。
5. 确认本地展示后双击 **publish.cmd**。它会重新生成网站、检查站内链接和图片、提交并推送源码到 `source`，然后将网页推送到 `main`。GitHub Pages 更新通常需要等待部署完成。

需要先检查发布环境时，可双击 **check.cmd** 做发布演练，不上传到 GitHub。

## 文章与图片

Obsidian 仓库使用 `F:\AAAAAA\Blog\source`。文章放在 `_posts/blog/` 内，图片放在 `img/` 内；无需另外创建 Git 仓库。`.obsidian` 设置和 `.trash` 回收站已加入 Git 忽略规则。

后续写好文章后，告诉助手需要整理和发布的文章。助手会优化标题、章节层级、段落衔接和排版，检查 Obsidian 图片嵌入、双链、公式等在博客中的兼容性，维护文章发布名单，完成本地展示检查后推送源码和网站。保留原文含义和未指定发布的笔记。

- 旧文章位于 `source/_posts/blog/大模型llm`、`电力电子学习`、`项目`。
- 原仓库有 14 篇文章，其中 10 篇在发布名单中。未发布的 4 篇笔记仍保持原状态。
- 手动创建或导入 `blog` 内的文章，需要在 `_config.yml` 的 `published_posts` 添加相对 `source/_posts/` 的路径；只设置 `published: true` 不够。使用新建入口会自动处理。
- 要隐藏名单中的文章，可从名单移除，或将文章头部设为 `published: false`。
- 图片放在 `source/img/`，文章中引用 `/img/文件名.png`。避免本机盘符路径和 Obsidian 专用的 `![[图片]]` 写法。
- 编辑旧文章时，保留文件名和原 `date`，可以继续保留旧网址。文章标题可修改 `title`。

## 发布约定

- `source` 保存文章、笔记、图片和配置，`main` 保存生成网页；不要将两个分支合并。
- `publish.cmd` 会提交本工程中所有未忽略的修改。`.local`、`node_modules`、`public`、部署缓存和 Obsidian 设置不会上传。
- 发布前检查 GitHub 身份和两个分支的推送权限。登录账号需要拥有仓库写权限；连接的 `mortalkit` 账号具有协作权限，也可使用仓库所有者账号。
- 如果远端源码有新提交，发布会停止。先在 **blog-shell.cmd** 中同步、解决冲突，再重新预览发布。同步前保存并提交自己的修改。
- `source/CNAME` 保留 `041101.xyz`，`source/.nojekyll` 保留 GitHub Pages 静态文件配置。
- 发布使用普通推送，不改写远端提交历史。

## 已准备的本地环境

`.local` 内是官方便携 Git 和 Node.js 22，以及锁定依赖所需的运行环境。入口会使用 Windows 已启用的代理，不修改系统代理设置。GitHub 登录由 Git Credential Manager 管理。

需要手动命令时双击 **blog-shell.cmd**，在该窗口使用：

```text
npm run article -- "文章标题" "分类名称"
npm run generate
npm run verify:site
npm run verify:blog
npm run publish:check
npm run publish
git status
```

`publish:check` 进行完整发布演练，检查两个分支的权限及生成站点部署，但不向 GitHub 上传内容。`verify:site` 检查现有生成页面和本地链接；`verify:blog` 检查原文章的分类与目录约定。原来的 `npm run verify` 用于已经移除的历史课程集合，不用于当前博客。

如果清理 `.local`，需要重新准备 Git 和 Node 运行环境；清理 `node_modules` 后，可以在准备好环境的窗口运行 `npm ci`。网站外部 CDN 资源需要网络连接。
