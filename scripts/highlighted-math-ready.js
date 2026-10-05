'use strict';

// The theme waits for window.load, including unrelated external statistics and
// sharing scripts. Highlighted article formulas can start as soon as the DOM is
// ready; leave the theme's MathJax configuration and other articles unchanged.
hexo.extend.filter.register('after_render:html', function highlightedMathReady(html) {
  if (!html.includes('class="buck-formula-label"')
      || !html.includes('const loadMathjax =')) return html;

  return html.replace(
    "window.pjax ? loadMathjax() : window.addEventListener('load', loadMathjax)",
    "document.readyState === 'loading'\n"
      + "      ? document.addEventListener('DOMContentLoaded', loadMathjax, { once: true })\n"
      + '      : loadMathjax()',
  );
});
