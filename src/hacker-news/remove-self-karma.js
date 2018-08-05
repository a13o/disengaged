/* global jscss */

/**
 * Remove the logged in user's karma from the page header
 * @see B.1
 */
(function removeSelfKarma () {
  jscss('table#hnmain > tbody > tr:first-child tr > td:last-child span.pagetop', {
    search: /\(\d+\)\s/,
    replace: ''
  })
})()
