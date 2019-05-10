/* global jscss */

/**
 * Remove post points
 * @see B.1
 */

/* New reddit */
(function removeCommentPoints () {
  jscss('[id="2x-container"] .Comment > div:last-child > div:first-of-type > span', {
    search: /([\d,]+\spoint[s]*)|(Score hidden)/,
    replace: '',
    replaceStyles: {
      paddingLeft: '0px'
    }
  });
})();