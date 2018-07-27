/* global MutationObserver */

/**
 * Remove the count at the top of the comment section
 * @see B.1
 */
(function removeCommentCount () {
  const ytApp = document.querySelector('ytd-app')
  if (!ytApp) { return }

  const observer = new MutationObserver(() => {
    const count = document.querySelector('ytd-comments-header-renderer h2#count .count-text')
    if (!count) { return }

    count.innerHTML = count.textContent.replace(/[\d,]+\s/, '')

    observer.disconnect()
  })
  observer.observe(ytApp, { childList: true, subtree: true })
})()
