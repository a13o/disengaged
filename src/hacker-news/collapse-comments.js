/**
 * This script automatically collapses comments in the tree past a certain depth.
 * 0 = collapse all comments
 * 1 = collapse everything after direct replies
 * 2 = collapse after replies to replies
 * Since Hacker News has a more mature userbase and strict moderation we will try
 * setting the depth to 2.
 * @type {number}
 */
const COMMENT_COLLAPSE_DEPTH = 2;

/**
 * Remove the logged in user's karma count from the page header
 */
(function removeSelfKarmaCount () {
  const self = document.querySelector('a#me')
  if (!self) return

  const karma = self.nextSibling
  const text = karma.data
  const start = text.indexOf('(')
  const len = text.indexOf(')') - start + 1
  karma.deleteData(start, len)
})();

/**
 * Remove all the point totals underneath each post
 */
(function removePostPoints () {
  document.querySelectorAll('td.subtext span.score').forEach((points) => {
    points.parentNode.removeChild(points)
  })
})();

/**
 * Remove the count from the comments link
 */
(function removeCommentCount () {
  document.querySelectorAll('td.subtext > a:last-child').forEach((comments) => {
    comments.innerHTML = comments.innerHTML.replace(/\d+/, '')
  })
})();

(function removeSelfPoints () {
  document.querySelectorAll('span[id^="score_"]').forEach((score) => {
    const parent = score.parentNode
    parent.removeChild(score.nextSibling)
    parent.removeChild(score)
  })
})();

/**
 * Collapse all comments starting at a certain depth. 0-indexed
 * @type {Number} depth
 */
(function collapseComments (depth) {
  document.querySelectorAll('tr.athing.comtr').forEach((comment) => {
    // already collapsed? nothing to do
    if (comment.classList.contains('coll')) return

    // convert depth to indentation
    const indent = comment.querySelector('td.ind img')
    const targetWidth = 40 * depth

    // rule out anything not indented deeply enough
    if (!indent.width || indent.width < targetWidth) return

    // set all of hn's classes for the collapsed comment
    comment.classList.add('coll')
    const toggle = comment.querySelector('.togg')
    toggle.innerHTML = `[+${toggle.getAttribute('n')}]`
    comment.querySelector('.comment').classList.add('noshow')
    comment.querySelector('.votelinks').classList.add('nosee')

    // sub comments are additionally hidden with noshow
    if (indent.width > targetWidth) {
      comment.classList.add('noshow')
    }
  })
})(COMMENT_COLLAPSE_DEPTH)
