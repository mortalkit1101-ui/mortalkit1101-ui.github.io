# 研究生课程迁移实施计划

1. 盘点 22 篇源 Markdown、29 张课程附件和 7 张散落 BJT 图片，建立文章、固定链接与图片命名映射。
2. 在 `source/_posts/graduate-courses/` 下生成两门课程的标准 Hexo 文章，补充 front matter，移除重复一级标题与旧 Obsidian 导航。
3. 将 Obsidian callout 和图片内链转换为标准 Markdown；为电源课程图片添加语义文件名、替代文字与图注。
4. 手工整理 BJT 文章现有内容，修正表达、术语和层级，不补写缺失知识。
5. 重建 `source/courses/index.md`，生成两个课程分组及课程内上一篇/下一篇导航。
6. 删除博客中现有的 `source/resources/graduate-courses/` 原始副本和 `_config.yml` 的对应 `skip_render` 规则，确保 PDF 不进入发布目录。
7. 运行 Hexo 清理与生成，并检查文章数量、残留 Obsidian 内链、缺图、PDF、教材名称、课程链接和生成页面。
8. 本地启动 Hexo，抽查 Courses 页面、BJT 页面与图片布局；发现问题后迭代修复并重新构建。
