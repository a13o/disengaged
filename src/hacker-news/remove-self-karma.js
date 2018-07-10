/**
 * Remove the logged in user's karma from the page header
 */
(function removeSelfKarma () {
  const self = document.querySelector('a#me')
  if (!self) return

  const karma = self.nextSibling
  const text = karma.data
  const start = text.indexOf('(')
  const len = text.indexOf(')') - start + 1
  karma.deleteData(start, len)
})()
