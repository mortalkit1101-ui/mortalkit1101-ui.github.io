'use strict';

const path = require('node:path');

hexo.extend.filter.register('before_generate', async function hideUnpublishedNotes() {
  const configuredPosts = Array.isArray(this.config.published_posts)
    ? this.config.published_posts
    : [];

  const allowedSources = new Set(configuredPosts.map(postPath => {
    const normalizedPath = String(postPath).replace(/\\/g, '/');
    return path.posix.join('_posts', normalizedPath);
  }));

  const updates = this.model('Post').toArray()
    .filter(post => post.source.startsWith('_posts/blog/'))
    .filter(post => !allowedSources.has(post.source))
    .filter(post => post.published !== false)
    .map(post => {
      post.published = false;
      return post.save();
    });

  await Promise.all(updates);
  this.locals.invalidate();
}, 1);

