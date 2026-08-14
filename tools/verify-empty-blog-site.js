const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const postsDir = path.join(root, 'source', '_posts');
const courseImagesDir = path.join(root, 'source', 'img', 'courses');
const configPath = path.join(root, '_config.butterfly.yml');
const indexPath = path.join(root, 'public', 'index.html');
const emptyHomeScriptPath = path.join(root, 'public', 'js', 'empty-home.js');
const expectedBackgroundSha256 = 'cfce96af87ea89166cd57b18bb7247d8427efdb64b49035030f3137ab3ec379b';
const sourceBackgroundPath = path.join(root, 'source', 'img', 'home-bg.png');
const publicBackgroundPath = path.join(root, 'public', 'img', 'home-bg.png');
const fixedStatsScriptPath = path.join(root, 'source', 'js', 'mortal-site-stats.js');
const generatedFixedStatsScriptPath = path.join(root, 'public', 'js', 'mortal-site-stats.js');

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function filesBelow(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(target) : [target];
  });
}

assert.equal(filesBelow(postsDir).length, 0, 'source/_posts must be empty');
assert.equal(fs.existsSync(courseImagesDir), false, 'course images must remain deleted');
assert.equal(fs.existsSync(fixedStatsScriptPath), false, 'fixed stats script must be deleted');
assert.equal(fs.existsSync(generatedFixedStatsScriptPath), false, 'fixed stats script must not be generated');
assert.equal(fs.existsSync(sourceBackgroundPath), true, 'source homepage background must exist');
assert.equal(fs.existsSync(publicBackgroundPath), true, 'generated homepage background must exist');
assert.equal(sha256(sourceBackgroundPath), expectedBackgroundSha256);
assert.equal(sha256(publicBackgroundPath), expectedBackgroundSha256);

const config = fs.readFileSync(configPath, 'utf8');
assert.match(config, /content: 从 0 开始的转码学习/);
assert.doesNotMatch(config, /记录从 0 开始的转码学习/);
assert.match(config, /index_img: \/img\/home-bg\.png/);
assert.doesNotMatch(config, /mortal-site-stats|7570927|10390377/);
assert.match(config, /busuanzi:\s*[\s\S]*site_uv: true[\s\S]*site_pv: true/);

assert.equal(fs.existsSync(indexPath), true, 'public/index.html must exist');
const index = fs.readFileSync(indexPath, 'utf8');
assert.match(index, /\/js\/empty-home\.js/);
assert.match(index, /从 0 开始的转码学习/);
assert.match(index, /busuanzi_value_site_uv/);
assert.match(index, /busuanzi_value_site_pv/);
assert.match(index, /\/img\/home-bg\.png/);
assert.doesNotMatch(index, /mortal-site-stats|7570927|10390377/);
assert.doesNotMatch(index, /文本词频统计项目实战|微波工程与工程电磁场|电源硬件与数字电源/);

const emptyHomeScript = fs.readFileSync(emptyHomeScriptPath, 'utf8');
assert.match(emptyHomeScript, /暂无文章/);

console.log('Empty Blog homepage verification passed.');
