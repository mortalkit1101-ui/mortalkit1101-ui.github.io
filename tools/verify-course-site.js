const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const sourcePosts = path.join(root, 'source', '_posts', 'graduate-courses')
const publicRoot = path.join(root, 'public')

const expected = {
  '电源硬件与数字电源': ['00', '01', '02', '03'],
  '微波工程与工程电磁场': Array.from({ length: 18 }, (_, index) => String(index).padStart(2, '0'))
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function readFrontMatter(file) {
  const markdown = fs.readFileSync(file, 'utf8')
  const match = markdown.match(/^---\n([\s\S]*?)\n---/)
  assert(match, `Missing front matter: ${file}`)
  const value = key => match[1].match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]
  const tagBlock = match[1].match(/^tags:\n((?:  - .+(?:\n|$))+)/m)?.[1] || ''
  const tags = [...tagBlock.matchAll(/^  - (.+)$/gm)].map(tagMatch => tagMatch[1])
  return { title: value('title'), series: value('series'), cover: value('cover'), tags, markdown }
}

function expectedTag(post) {
  if (post.series === '电源硬件与数字电源') return '电力电子'
  if (post.title.startsWith('00 ')) return '微波工程与工程电磁场学习计划'
  const number = Number(post.title.slice(0, 2))
  return number >= 2 && number <= 8 ? '电磁场' : '微波工程'
}

const posts = []
for (const courseDirectory of fs.readdirSync(sourcePosts)) {
  const directory = path.join(sourcePosts, courseDirectory)
  for (const name of fs.readdirSync(directory).filter(file => file.endsWith('.md'))) {
    posts.push(readFrontMatter(path.join(directory, name)))
  }
}

assert(posts.length === 22, `Expected 22 course posts, found ${posts.length}`)
assert(!fs.existsSync(path.join(root, 'source', '_posts', 'welcome-to-mortal.md')), 'Welcome source post still exists')

for (const [course, numbers] of Object.entries(expected)) {
  const coursePosts = posts.filter(post => post.series === course).sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'))
  assert(coursePosts.length === numbers.length, `${course} expected ${numbers.length} posts, found ${coursePosts.length}`)
  assert(coursePosts.map(post => post.title.slice(0, 2)).join(',') === numbers.join(','), `${course} source order is invalid`)

  const categoryFile = path.join(publicRoot, 'categories', course, 'index.html')
  assert(fs.existsSync(categoryFile), `Missing category page: ${course}`)
  const categoryHtml = fs.readFileSync(categoryFile, 'utf8')
  const generatedNumbers = [...categoryHtml.matchAll(/article-sort-item-title[^>]*title="(\d{2}) /g)].map(match => match[1])
  assert(generatedNumbers.join(',') === numbers.join(','), `${course} generated category order is invalid`)
}

for (const post of posts) {
  assert(post.tags.length === 1, `${post.title} expected one tag, found ${post.tags.length}`)
  assert(post.tags[0] === expectedTag(post), `${post.title} has incorrect tag: ${post.tags.join(', ')}`)
  assert(post.cover?.startsWith('/img/'), `Invalid cover for ${post.title}`)
  const sourceCover = path.join(root, 'source', ...post.cover.slice(1).split('/'))
  const publicCover = path.join(publicRoot, ...post.cover.slice(1).split('/'))
  assert(fs.existsSync(sourceCover), `Missing source cover for ${post.title}: ${post.cover}`)
  assert(fs.existsSync(publicCover), `Missing generated cover for ${post.title}: ${post.cover}`)
}

const homepage = fs.readFileSync(path.join(publicRoot, 'index.html'), 'utf8')
const categoryNames = [...homepage.matchAll(/card-category-list-name">([^<]+)</g)].map(match => match[1])
const expectedCategories = [...Object.keys(expected), '规划']
assert(categoryNames.length === 3, `Expected three sidebar categories, found ${categoryNames.length}`)
assert(categoryNames.every(name => expectedCategories.includes(name)), `Unexpected sidebar category: ${categoryNames.join(', ')}`)
assert(!homepage.includes('Welcome to Mortal'), 'Homepage still contains Welcome to Mortal')

const expectedTags = ['电力电子', '电磁场', '微波工程', '微波工程与工程电磁场学习计划', '研究生期间规划'].sort((a, b) => a.localeCompare(b, 'zh-CN'))
const generatedTags = fs.readdirSync(path.join(publicRoot, 'tags'), { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .sort((a, b) => a.localeCompare(b, 'zh-CN'))
assert(generatedTags.join('|') === expectedTags.join('|'), `Unexpected generated tags: ${generatedTags.join(', ')}`)

const imageReferences = new Set()
for (const file of walk(publicRoot).filter(file => file.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8')
  for (const match of html.matchAll(/(?:src|data-lazy-src)="(\/img\/[^"?#]+)/g)) imageReferences.add(decodeURI(match[1]))
}
for (const reference of imageReferences) {
  assert(fs.existsSync(path.join(publicRoot, ...reference.slice(1).split('/'))), `Missing generated image: ${reference}`)
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(target) : [target]
  })
}

console.log('Site verification passed: 22 course posts, 3 categories, 5 tags, ordered series, 22 covers, no missing local images.')
