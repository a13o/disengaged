/* global MutationObserver */

/**
 * Remove the component triggering ajax requests for more comments
 * @see A.2
 */
(function removeInfiniteComments () {
  const ytgApp = document.querySelector('ytg-app')
  if (ytgApp) {
    const observer = new MutationObserver(() => {
      // Make sure at least the first page of comments has loaded
      const comments = document.querySelector('ytg-scroll-pane:last-child div#items')
      if (!comments || comments.childElementCount === 0) { return }

      // Remove the component powering the infinite scroll
      const cont = document.querySelector('ytg-scroll-pane:last-child div#continuations')
      if (!cont) { return }
      cont.parentNode.removeChild(cont)

      observer.disconnect()
    })
    observer.observe(ytgApp, { childList: true, subtree: true })
  }
})()
