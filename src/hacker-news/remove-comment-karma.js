/**
 * Remove karma totals next to comments (typically seen next to your own comments when
 * logged in)
 */
(function removeCommentKarma () {
  document.querySelectorAll('span[id^="score_"]').forEach((score) => {
    const parent = score.parentNode
    parent.removeChild(score.nextSibling)
    parent.removeChild(score)
  })
})()
