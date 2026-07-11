# 课程标签整理实施计划

1. 在 `tools/apply-course-metadata.js` 中加入按文章编号计算课程标签的规则，并让 front matter 重写逻辑清除旧 tags 后写入唯一标签。
2. 运行元数据脚本，将规则应用到现有 22 篇课程文章。
3. 扩展 `tools/verify-course-site.js`，检查每篇文章只有一个正确标签，以及生成结果仅包含 4 个标签页。
4. 清理并重新生成 Hexo 站点，运行自动验证和差异检查。
5. 提交本地 Hexo 源码，将 `public` 镜像到 `.deploy_pages`，获取并衔接最新远端历史。
6. 推送 GitHub Pages，检查对应 Actions 运行成功，并在线抽查四种标签及代表性文章。
