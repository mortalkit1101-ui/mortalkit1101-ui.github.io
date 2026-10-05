'use strict';

const path = require('node:path');

// Keep vault-relative Markdown links editable in Obsidian, and resolve source/img
// links to their public paths only in the rendered article.
hexo.extend.filter.register('after_post_render', function resolveVaultImages(data) {
  if (!data.obsidian_image_paths || !data.source) return data;

  data.content = data.content.replace(
    /(<img\b[^>]*?\ssrc=")([^"<>]+)(")/gi,
    (match, prefix, reference, suffix) => {
      if (/^(?:\/|[a-z][a-z\d+.-]*:)/i.test(reference)) return match;
      const tailIndex = reference.search(/[?#]/);
      const pathname = tailIndex < 0 ? reference : reference.slice(0, tailIndex);
      const tail = tailIndex < 0 ? '' : reference.slice(tailIndex);
      let decoded;
      try { decoded = decodeURIComponent(pathname); } catch { return match; }
      const resolved = path.posix.normalize(path.posix.join(
        path.posix.dirname(data.source.replace(/\\/g, '/')), decoded,
      ));
      if (!resolved.startsWith('img/')) return match;
      return `${prefix}${encodeURI(`/${resolved}`)}${tail}${suffix}`;
    },
  );
  return data;
});
