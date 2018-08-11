/**
 * This script automatically collapses comments in the tree past a certain depth.
 * 0 = collapse all comments
 * 1 = collapse everything after direct replies
 * 2 = collapse after replies to replies
 * etc.
 * @type {number}
 */
const COMMENT_COLLAPSE_DEPTH = 1;

/**
 * Collapse all comments starting at a certain depth. 0-indexed
 * @see A.2
 * @type {Number} depth
 */
(function collapseDeepComments (depth) {
  let indentWidth;

  document.querySelectorAll('tr.athing.comtr').forEach((comment) => {
    // already collapsed? nothing to do
    if (comment.classList.contains('coll')) return;

    // measure the indentation element to see how nested we are
    const indent = comment.querySelector('td.ind img');
    if (!indentWidth && indent.width) {
      // varies by platform; 40px on desktop and 12px on mobile
      indentWidth = indent.width;
    }
    // convert depth to indentation
    const targetWidth = indentWidth * depth;

    // rule out anything not indented deeply enough
    if (!indent.width || indent.width < targetWidth) return;

    // set all of hn's classes for the collapsed comment
    comment.classList.add('coll');
    const toggle = comment.querySelector('.togg');
    toggle.textContent = `[+${toggle.getAttribute('n')}]`;
    comment.querySelector('.comment').classList.add('noshow');
    comment.querySelector('.votelinks').classList.add('nosee');

    // sub comments are additionally hidden with noshow
    if (indent.width > targetWidth) {
      comment.classList.add('noshow');
    }
  });
})(COMMENT_COLLAPSE_DEPTH);
