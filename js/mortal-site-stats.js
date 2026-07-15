(() => {
  const stats = {
    siteUv: '7570927',
    sitePv: '10390377'
  }

  const setText = (id, value) => {
    const el = document.getElementById(id)
    if (el && el.textContent !== value) el.textContent = value
  }

  const applyStats = () => {
    setText('busuanzi_value_site_uv', stats.siteUv)
    setText('busuanzi_value_site_pv', stats.sitePv)
  }

  const start = () => {
    applyStats()
    const observer = new MutationObserver(applyStats)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    setTimeout(() => observer.disconnect(), 10000)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start)
  } else {
    start()
  }

  window.addEventListener('pjax:complete', start)
})()
