/* global jscss */

/**
 * Remove the count at the top of the comment section
 * @see B.1
 */
(function removeCommentCount () {
  jscss('ytd-comments-header-renderer h2#count .count-text', {
    search: /[\d,]+\s/,
    replace: '',
    firstResultOnly: true
  });
})();
