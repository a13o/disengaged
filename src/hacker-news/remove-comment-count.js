/**
 * Remove the count from the comments link on each post
 */
(function removeCommentCount () {
  document.querySelectorAll('td.subtext > a:last-child').forEach((comments) => {
    comments.innerHTML = comments.innerHTML.replace(/\d+/, '')
  })
})()
