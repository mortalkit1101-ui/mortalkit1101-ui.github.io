'use strict';

const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const { normalizeCategoryNames } = require('./category-rules');

const root = path.resolve(__dirname, '..');
const [title, category = '随笔'] = process.argv.slice(2);
if (!title || !title.trim()) {
  console.error('用法：npm run article -- "文章标题" "分类名称"');
  process.exit(1);
}

function filename(value) {
  const name = value.trim().replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').replace(/[. ]+$/, '');
  if (!name || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name)) {
    throw new Error('请使用有效的文章标题和分类名称。');
  }
  return name;
}

const relative = `blog/${filename(category)}/${filename(title)}.md`;
const target = path.join(root, 'source', '_posts', relative);
if (fs.existsSync(target)) throw new Error(`文章已存在，未覆盖：${target}`);

const configPath = path.join(root, '_config.yml');
const configText = fs.readFileSync(configPath, 'utf8');
const config = yaml.load(configText);
if (!Array.isArray(config.published_posts)) throw new Error('配置缺少 published_posts 名单。');

const now = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
}).format(new Date());
const frontMatter = yaml.dump({
  title: title.trim(), date: now, tags: [],
  categories: normalizeCategoryNames([category.trim()]),
  toc_number: false, mathjax: true, published: true,
}, { lineWidth: -1 });

const block = /^published_posts:[^\r\n]*(?:\r?\n(?:[ \t]+[^\r\n]*|[ \t]*))*/m;
if (!block.test(configText)) throw new Error('无法识别文章发布名单，配置未修改。');
const updated = config.published_posts.includes(relative) ? configText
  : configText.replace(block, match => `${match.trimEnd()}\n  - ${JSON.stringify(relative)}\n\n`);

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, `---\n${frontMatter}---\n\n## 正文\n\n在这里编写文章。\n`, { flag: 'wx' });
fs.writeFileSync(configPath, updated);
console.log(`已创建文章，并加入发布名单：\n${target}\n保存内容后刷新本地预览，确认后运行发布入口。`);
