/**
 * Remove the count from the comments link on each post
 * @see B.1
 */
(function removeCommentCount () {
  document.querySelectorAll('td.subtext > a:last-child').forEach((comments) => {
    comments.innerHTML = comments.text.replace(/\d+\s/, '')
  })
})()
