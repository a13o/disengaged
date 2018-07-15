/* global MutationObserver */

/**
 * Remove the component triggering ajax requests for more comments
 * @see A.2
 */
(function removeInfiniteComments () {
  const ytApp = document.querySelector('ytd-app')
  const observer = new MutationObserver(() => {
    // Make sure at least the first page of comments has loaded
    const comment = document.querySelector('ytd-comments ytd-comment-thread-renderer')
    if (!comment) { return }

    // Remove the component powering the infinite scroll
    const cont = document.querySelector('ytd-comments div#continuations')
    cont.parentNode.removeChild(cont)

    observer.disconnect()
  })
  observer.observe(ytApp, { childList: true, subtree: true })
})()
