'use strict';

const { normalizeCategoryNames } = require('../tools/category-rules');

hexo.extend.filter.register(
  'before_generate',
  async function normalizePostCategories() {
    const posts = this.model('Post').find({ published: true }).toArray();

    for (const post of posts) {
      const current = post.categories
        .toArray()
        .map(category => category.name);
      const normalized = normalizeCategoryNames(current);

      if (current.join('\0') !== normalized.join('\0')) {
        await post.setCategories(normalized);
      }
    }
  },
  20,
);
