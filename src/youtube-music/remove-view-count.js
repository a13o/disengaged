/* global jscss */

/**
 * Remove view counts
 * @see B.1
 */
(function removeViewCounts () {
  // Youtube Music hotlist
  jscss('.ytmusic-full-bleed-item-renderer.subtitle', {
    search: /^\s•\s|[\d.]+[KMB]*\sviews$/,
    replace: '',
    firstResultOnly: true
  })
})()
