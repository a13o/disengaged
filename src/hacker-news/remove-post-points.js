/**
 * Remove all the point totals underneath each post
 */
(function removePostPoints () {
  document.querySelectorAll('td.subtext span.score').forEach((points) => {
    points.parentNode.removeChild(points)
  })
})()
