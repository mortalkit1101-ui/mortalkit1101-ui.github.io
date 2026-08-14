'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  CANONICAL_LLM_CATEGORY,
  normalizeCategoryNames,
} = require('./category-rules');

const root = path.resolve(__dirname, '..');
const postsRoot = path.join(root, 'source', '_posts');
const publicRoot = path.join(root, 'public');

function markdownFiles(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.name === '.obsidian') return [];

    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(target);
    return entry.isFile() && entry.name.endsWith('.md') ? [target] : [];
  });
}

assert.deepEqual(normalizeCategoryNames(['大模型']), [CANONICAL_LLM_CATEGORY]);
assert.deepEqual(normalizeCategoryNames(['LLM']), [CANONICAL_LLM_CATEGORY]);
assert.deepEqual(
  normalizeCategoryNames(['大模型', 'LLM', 'Python']),
  [CANONICAL_LLM_CATEGORY, 'Python'],
);

for (const file of markdownFiles(postsRoot)) {
  const markdown = fs.readFileSync(file, 'utf8');
  const frontMatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert(frontMatter, `Missing Front Matter: ${file}`);

  const date = frontMatter[1].match(/^date:\s*(.+)$/m);
  assert(
    date && !Number.isNaN(Date.parse(date[1].trim())),
    `Invalid date: ${file}`,
  );
}

const homepage = fs.readFileSync(path.join(publicRoot, 'index.html'), 'utf8');
const card = homepage.match(
  /<div class="card-widget card-categories">([\s\S]*?)<div class="card-widget card-tags">/,
);
assert(card, 'Missing homepage category card');

const names = [
  ...card[1].matchAll(/card-category-list-name">([^<]+)</g),
].map(match => match[1]);
assert.equal(
  names.filter(name => name === CANONICAL_LLM_CATEGORY).length,
  1,
);
assert(
  !names.includes('大模型') && !names.includes('LLM'),
  'Legacy LLM categories remain visible',
);

const link = card[1].match(new RegExp(
  `href="([^"]+)"><span class="card-category-list-name">${CANONICAL_LLM_CATEGORY}</span>`,
));
assert(link, 'Missing canonical category link');

const segments = decodeURIComponent(link[1]).split('/').filter(Boolean);
const categoryFile = path.join(publicRoot, ...segments, 'index.html');
assert(fs.existsSync(categoryFile), `Missing category page: ${categoryFile}`);

const categoryHtml = fs.readFileSync(categoryFile, 'utf8');
const dates = [
  ...categoryHtml.matchAll(
    /class="post-meta-date-created" datetime="([^"]+)"/g,
  ),
].map(match => Date.parse(match[1]));
assert(dates.length > 0, 'Category page has no articles');
assert(
  dates.every((date, index) => index === 0 || dates[index - 1] >= date),
  'Category dates are not descending',
);

console.log('Blog category verification passed.');
