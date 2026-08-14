# 真实统计与首页背景设计

## 背景

侧栏“本站访客数”和“本站总浏览量”目前被 `source/js/mortal-site-stats.js` 强制覆盖为固定值 `7570927` 和 `10390377`，并非真实访问数据。Butterfly 的“不蒜子”统计已经在 `_config.butterfly.yml` 中启用，但其结果被该脚本覆盖。

首页顶部背景当前由 `index_img: /img/mortal-bg.jpg` 指向电路板图片。用户提供的新图片尺寸为 1320 × 739，适合作为横向首页背景。

## 目标

- 移除所有固定访客数和浏览量。
- 使用 Butterfly 已启用的“不蒜子”服务提供真实站点 UV 和 PV。
- 将用户提供的图二保存为站点资源并替换首页顶部背景。
- 只更改首页背景；其他页面默认顶部图片和页脚继续使用 `/img/mortal-bg.jpg`。
- 保留现有“暂无文章”首页和“从 0 开始的转码学习”公告。
- 将源码推送到 `source`，将验证后的生成站点发布到 `main`。

## 实现设计

### 真实统计

- 删除 `source/js/mortal-site-stats.js`。
- 从 Butterfly `inject.bottom` 中删除 `/js/mortal-site-stats.js` 引用。
- 保留 `busuanzi.site_uv`、`busuanzi.site_pv` 和 `busuanzi.page_pv` 为 `true`。
- 不增加本地回退数字；第三方服务尚未返回时沿用主题的加载状态，返回后显示真实计数。

### 首页背景

- 将用户提供的原始 PNG 复制为 `source/img/home-bg.png`，不重绘、不压缩、不改变内容。
- 将 `_config.butterfly.yml` 中的 `index_img` 改为 `/img/home-bg.png`。
- 保留 `default_top_img` 和 `footer_img` 为 `/img/mortal-bg.jpg`。
- 使用 Butterfly 默认居中和 `cover` 规则适配不同屏幕。

## 验证

- 源码和生成目录均不再包含固定数字或 `mortal-site-stats.js`。
- 生成首页仍包含不蒜子 `site_uv` 与 `site_pv` 元素和主题统计加载逻辑。
- `public/img/home-bg.png` 与用户原图 SHA-256 完全一致。
- 生成首页引用 `/img/home-bg.png`，并继续包含“暂无文章”和现有公告。
- 本地浏览器检查桌面布局，确认首页背景、空状态和统计卡片正常。
- 发布后检查线上首页返回新背景引用且不再加载固定统计脚本。

## 保留范围

不更改文章内容、头像、关于页、域名、默认页面背景、页脚背景或 GitHub Pages 仓库配置。
