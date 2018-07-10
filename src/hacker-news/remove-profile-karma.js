/**
 * Remove karma count from user profiles
 */
(function removeProfileKarma () {
  document.querySelectorAll('td[valign="top"]').forEach((td) => {
    if (td.innerText !== 'karma:') return

    const tr = td.parentNode
    tr.parentNode.removeChild(tr)
  })
})()
