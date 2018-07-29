/* global MutationObserver */

/**
 * Remove view counts
 * @see B.1
 */
(function removeViewCounts () {
  // Youtube Music hotlist
  const ytmApp = document.querySelector('ytmusic-app')
  if (ytmApp) {
    const observer = new MutationObserver(() => {
      const subtitles = document.querySelectorAll('.ytmusic-full-bleed-item-renderer.subtitle')
      if (subtitles.length === 0) { return }

      // Wait for text to load
      if (subtitles[0].textContent === '') { return }

      subtitles.forEach((subtitle) => {
        subtitle.removeChild(subtitle.childNodes[2]) // view count
        subtitle.removeChild(subtitle.childNodes[1]) // • separator
      })
      observer.disconnect()
    })
    observer.observe(ytmApp, { childList: true, subtree: true })
  }
})()
