'use strict';

const path = require('node:path');

// Keep Markdown images inside the current source/_posts/blog Obsidian vault.
// Its img mirror and source/img both use /img URLs on the published site.
hexo.extend.filter.register('after_post_render', function resolveVaultImages(data) {
  const source = (data.source || '').replace(/\\/g, '/');
  const enabled = data.obsidian_image_paths ?? source.startsWith('_posts/blog/');
  if (!enabled || !source) return data;

  data.content = data.content.replace(
    /(<img\b[^>]*?\ssrc=")([^"<>]+)(")/gi,
    (match, prefix, reference, suffix) => {
      // Marked prepends the site root to ../img vault references by default.
      if (/^\/(?:\.\.\/)+img\//i.test(reference)) reference = reference.slice(1);
      if (/^(?:\/|[a-z][a-z\d+.-]*:)/i.test(reference)) return match;
      const tailIndex = reference.search(/[?#]/);
      const pathname = tailIndex < 0 ? reference : reference.slice(0, tailIndex);
      const tail = tailIndex < 0 ? '' : reference.slice(tailIndex);
      let decoded;
      try { decoded = decodeURIComponent(pathname); } catch { return match; }
      const resolved = path.posix.normalize(path.posix.join(
        path.posix.dirname(source), decoded,
      ));
      const publicPath = resolved.startsWith('_posts/blog/img/')
        ? resolved.slice('_posts/blog/'.length)
        : resolved;
      if (!publicPath.startsWith('img/')) return match;
      return `${prefix}${encodeURI(`/${publicPath}`)}${tail}${suffix}`;
    },
  );
  return data;
});
