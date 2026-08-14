# 全站统一主页背景设计

## 目标

将博客所有页面顶部横幅和页脚统一为现有主页背景 `source/img/home-bg.png`，并彻底删除旧电路板背景 `source/img/mortal-bg.jpg`。

## 配置方案

- 保留 `index_img: /img/home-bg.png`，首页背景不变。
- 将 `default_top_img` 改为 `/img/home-bg.png`，使文章页、分类页、标签页、归档页、关于页和其他未单独配置背景的页面统一使用主页背景。
- 将 `footer_img` 改为 `/img/home-bg.png`，使全站页脚同步使用主页背景。
- 保持 `archive_img`、`tag_img`、`category_img` 等专用配置为空，使其继续回退到 `default_top_img`。
- 不覆盖未来文章显式设置的 `top_img` 或 `cover`。

## 资源处理

- 删除 `source/img/mortal-bg.jpg`。
- 不下载或添加外部候选图片。
- 历史设计文档中的旧文件名作为记录保留，不视为运行时引用。

## 验证

- 更新站点验证脚本，要求三个活动配置项均指向 `/img/home-bg.png`。
- 验证源目录和生成目录中都不存在 `mortal-bg.jpg`。
- 验证生成的 HTML、CSS 和 JavaScript 不再包含 `/img/mortal-bg.jpg`。
- 运行 Hexo 清理、生成和自动检查。
- 检查首页、文章页、分类页、标签页、归档页和关于页在桌面及移动视口下的背景、图片加载和页面布局。

## 发布

- 将源文件正常提交并推送到 `source` 分支。
- 使用现有发布脚本将生成站点正常推送到独立的 `main` 分支。
- 不合并两条分支历史，不强制推送。
- 发布后验证 `https://041101.xyz` 及主要页面正常展示。
