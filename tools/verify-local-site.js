'use strict';

const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'public');
const config = yaml.load(fs.readFileSync(path.join(root, '_config.yml'), 'utf8'));
const origin = new URL(config.url).origin;
const errors = new Set();
let pages = 0;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

if (!fs.existsSync(path.join(output, 'index.html'))) throw new Error('首页未生成。');
for (const file of walk(output).filter(file => file.endsWith('.html'))) {
  pages++;
  const relative = path.relative(output, file).split(path.sep).join('/');
  const base = new URL(relative, `${origin}/`);
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/(?:href|src|data-lazy-src)=["']([^"']+)["']/g)) {
    const reference = match[1].replace(/&amp;/g, '&');
    if (/^(?:#|mailto:|tel:|data:|javascript:)/i.test(reference)) continue;
    let url;
    try { url = new URL(reference, base); } catch { continue; }
    if (url.origin !== origin) continue;
    const target = path.resolve(output, `.${decodeURIComponent(url.pathname)}`);
    if (!target.startsWith(output + path.sep) && target !== output) {
      errors.add(`越界链接：${relative} -> ${reference}`);
      continue;
    }
    const exists = fs.existsSync(target) && (fs.statSync(target).isFile()
      || fs.existsSync(path.join(target, 'index.html')));
    if (!exists) errors.add(`缺少页面或资源：${relative} -> ${reference}`);
  }
}
if (!fs.existsSync(path.join(output, '.nojekyll'))) errors.add('缺少 .nojekyll');
if (fs.existsSync(path.join(root, 'source', 'CNAME'))) {
  if (!fs.existsSync(path.join(output, 'CNAME'))
      || fs.readFileSync(path.join(root, 'source', 'CNAME'), 'utf8').trim()
      !== fs.readFileSync(path.join(output, 'CNAME'), 'utf8').trim()) {
    errors.add('生成站点的域名配置不一致。');
  }
}
if (errors.size) throw new Error([...errors].join('\n'));
console.log(`本地站点检查通过：${pages} 个页面，站内链接、图片与域名配置完整。`);
