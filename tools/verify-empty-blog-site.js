const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const postsDir = path.join(root, 'source', '_posts');
const courseImagesDir = path.join(root, 'source', 'img', 'courses');
const configPath = path.join(root, '_config.butterfly.yml');
const indexPath = path.join(root, 'public', 'index.html');
const emptyHomeScriptPath = path.join(root, 'public', 'js', 'empty-home.js');

function filesBelow(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(target) : [target];
  });
}

assert.equal(filesBelow(postsDir).length, 0, 'source/_posts must be empty');
assert.equal(fs.existsSync(courseImagesDir), false, 'course images must remain deleted');

const config = fs.readFileSync(configPath, 'utf8');
assert.match(config, /content: 从 0 开始的转码学习/);
assert.doesNotMatch(config, /记录从 0 开始的转码学习/);

assert.equal(fs.existsSync(indexPath), true, 'public/index.html must exist');
const index = fs.readFileSync(indexPath, 'utf8');
assert.match(index, /type-empty-home/);
assert.match(index, /\/js\/empty-home\.js/);
assert.match(index, /从 0 开始的转码学习/);
assert.doesNotMatch(index, /文本词频统计项目实战|微波工程与工程电磁场|电源硬件与数字电源/);

const emptyHomeScript = fs.readFileSync(emptyHomeScriptPath, 'utf8');
assert.match(emptyHomeScript, /暂无文章/);

console.log('Empty Blog homepage verification passed.');
