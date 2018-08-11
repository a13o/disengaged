/**
 * Collapse all comments HN has already deemed lower quality
 * @see A.2
 */
(function collapseLowQualityComments () {
  document.querySelectorAll('tr.athing.comtr').forEach((comment) => {
    // already collapsed? nothing to do
    if (comment.classList.contains('coll')) return;

    const fadedSpan = comment.querySelector('div.comment > span:not(.c00)');

    const div = comment.querySelector('div.comment');
    const flagged = div.textContent.trim() === '[flagged]';

    if (fadedSpan || flagged) {
      // set all of hn's classes for the collapsed comment
      comment.classList.add('coll');
      const toggle = comment.querySelector('.togg');
      toggle.textContent = `[+${toggle.getAttribute('n')}]`;
      comment.querySelector('.comment').classList.add('noshow');
      comment.querySelector('.votelinks').classList.add('nosee');
    }
  });
})();
