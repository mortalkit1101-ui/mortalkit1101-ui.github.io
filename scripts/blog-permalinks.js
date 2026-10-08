'use strict';

// Keep exceptional old URLs outside the editable note properties.
// Run before Hexo's permalink filter, which reads __permalink.
hexo.extend.filter.register('post_permalink', function preserveBlogUrl(data) {
  const source = (data.source || '').replace(/\\/g, '/');
  if (source.startsWith('_posts/blog/') && !data.__permalink) {
    const configured = this.config.blog_permalinks || {};
    const permalink = configured[source.slice('_posts/'.length)];
    if (typeof permalink === 'string' && permalink) data.__permalink = permalink;
  }
  return data;
}, 5);
