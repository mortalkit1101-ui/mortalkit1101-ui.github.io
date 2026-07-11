const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const postRoot = path.join(root, 'source', '_posts', 'graduate-courses')

const courses = [
  {
    directory: 'power-electronics',
    name: '电源硬件与数字电源',
    posts: {
      'learning-roadmap': ['00 电源硬件与数字电源学习路线', '/img/courses/covers/power-learning-roadmap.svg'],
      '01-introduction': [null, '/img/courses/power-electronics/01-introduction/01-01-power-electronics-overview.png'],
      '02-power-diode': [null, '/img/courses/power-electronics/02-power-diode/02-06-power-diode-structure.png'],
      '03-bjt': [null, '/img/courses/power-electronics/03-bjt/03-05-power-bjt-structure.png']
    }
  },
  {
    directory: 'microwave-engineering',
    name: '微波工程与工程电磁场',
    posts: Object.fromEntries([
      '00-study-plan', '01-learning-framework', '02-field-and-potential',
      '03-electrostatic-boundary-and-capacitance', '04-static-magnetic-field-and-inductance',
      '05-maxwell-equations', '06-plane-waves', '07-uniform-transmission-lines',
      '08-waveguides-and-cavities', '09-microwave-electromagnetics',
      '10-microwave-transmission-lines', '11-transmission-lines-and-waveguides',
      '12-microwave-network-analysis', '13-impedance-matching', '14-microwave-resonators',
      '15-power-dividers-and-couplers', '16-microwave-filters', '17-microwave-systems'
    ].map(slug => [slug, [null, `/img/courses/covers/${slug}.svg`]]))
  }
]

function rewriteFrontMatter(markdown, course, title, cover) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
  if (!match) throw new Error('Missing front matter')
  const lines = match[1].split(/\r?\n/)
  const kept = []
  const replacedKeys = new Set(['categories', 'series', 'cover'])

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const keyMatch = line.match(/^([A-Za-z_][\w-]*):/)
    if (keyMatch && replacedKeys.has(keyMatch[1])) {
      while (index + 1 < lines.length && /^\s+/.test(lines[index + 1])) index += 1
      continue
    }
    kept.push(title && line.startsWith('title:') ? `title: ${title}` : line)
  }

  const frontMatter = [
    ...kept,
    'categories:',
    `  - ${course}`,
    `series: ${course}`,
    `cover: ${cover}`
  ].join('\n')

  return `---\n${frontMatter}\n---\n\n${markdown.slice(match[0].length).replace(/^\s+/, '')}`
}

function rewriteCategoryLink(markdown, course) {
  const parent = encodeURIComponent('研究生课程')
  const encodedCourse = encodeURIComponent(course)
  return markdown
    .replaceAll(`/categories/${parent}/${encodedCourse}/`, `/categories/${encodedCourse}/`)
    .replaceAll(`/categories/研究生课程/${course}/`, `/categories/${course}/`)
}

function readFrontMatterValue(file, key) {
  const markdown = fs.readFileSync(file, 'utf8')
  return markdown.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]
}

function rewriteCourseNavigation(markdown, course, slug) {
  const order = Object.keys(course.posts)
  const index = order.indexOf(slug)
  const linkFor = (targetSlug, label) => {
    const targetFile = path.join(postRoot, course.directory, `${targetSlug}.md`)
    const overrideTitle = course.posts[targetSlug][0]
    const title = overrideTitle || readFrontMatterValue(targetFile, 'title')
    const permalink = readFrontMatterValue(targetFile, 'permalink')
    return `[${label}：${title}](/${permalink})`
  }

  const links = []
  if (index > 0) links.push(linkFor(order[index - 1], '上一篇'))
  links.push(`[返回${course.name}分类](/categories/${encodeURIComponent(course.name)}/)`)
  if (index < order.length - 1) links.push(linkFor(order[index + 1], '下一篇'))

  const navigation = `**课程导航：** ${links.join(' · ')}`
  if (!/^\*\*课程导航：\*\*.*$/m.test(markdown)) throw new Error(`Missing course navigation: ${course.directory}/${slug}`)
  return markdown.replace(/^\*\*课程导航：\*\*.*$/m, navigation)
}

let updated = 0
for (const course of courses) {
  const directory = path.join(postRoot, course.directory)
  const expected = new Set(Object.keys(course.posts))

  for (const file of fs.readdirSync(directory).filter(name => name.endsWith('.md'))) {
    const slug = path.basename(file, '.md')
    if (!expected.has(slug)) throw new Error(`Unexpected course post: ${course.directory}/${file}`)
    expected.delete(slug)
    const [title, cover] = course.posts[slug]
    const target = path.join(directory, file)
    let markdown = fs.readFileSync(target, 'utf8')
    markdown = rewriteFrontMatter(markdown, course.name, title, cover)
    markdown = rewriteCategoryLink(markdown, course.name)
    markdown = rewriteCourseNavigation(markdown, course, slug)
    fs.writeFileSync(target, markdown.replace(/\r\n/g, '\n'), 'utf8')
    updated += 1
  }

  if (expected.size) throw new Error(`Missing course posts: ${[...expected].join(', ')}`)
}

console.log(`Updated metadata for ${updated} course posts.`)
