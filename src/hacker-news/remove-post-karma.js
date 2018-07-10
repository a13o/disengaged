/**
 * Remove all the karma totals underneath each post
 */
(function removePostKarma () {
  document.querySelectorAll('td.subtext span.score').forEach((points) => {
    points.parentNode.removeChild(points)
  })
})()
