/**
 * Remove suggested videos
 * @see A.1
 */

(function removeSuggestedVideos () {
  // Suggested videos are already removed by css, but it leaves a lot of whitespace
  // on the right side of the page. If we toggle theater-view it makes things look
  // nice again
  document.cookie = 'wide=1; path=/; domain=.youtube.com'
})()
