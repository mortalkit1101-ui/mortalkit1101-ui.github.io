(() => {
  const renderEmptyHome = () => {
    const postList = document.querySelector(
      '.type-empty-home #recent-posts .recent-post-items',
    );

    if (!postList || postList.children.length !== 0) return;

    const emptyState = document.createElement('div');
    emptyState.className = 'recent-post-empty';
    emptyState.textContent = '暂无文章';
    postList.append(emptyState);
  };

  document.addEventListener('DOMContentLoaded', renderEmptyHome);
  document.addEventListener('pjax:complete', renderEmptyHome);
  renderEmptyHome();
})();
