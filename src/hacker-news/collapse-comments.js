/**
 * This script automatically collapses comments in the tree past a certain depth.
 * 0 = collapse all comments
 * 1 = collapse everything after direct replies
 * 2 = collapse after replies to replies
 * etc.
 * Since Hacker News has a more mature userbase and strict moderation we will try
 * setting the depth to 2.
 * @type {number}
 */
const COMMENT_COLLAPSE_DEPTH = 2;

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
