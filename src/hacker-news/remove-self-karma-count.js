/**
 * Remove the logged in user's karma count from the page header
 */
(function removeSelfKarmaCount () {
  const self = document.querySelector('a#me')
  if (!self) return

  const karma = self.nextSibling
  const text = karma.data
  const start = text.indexOf('(')
  const len = text.indexOf(')') - start + 1
  karma.deleteData(start, len)
})()
