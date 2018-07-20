/* global MutationObserver */

/**
 * Remove view counts
 * @see B.1
 */
(function removeViewCounts () {
  const path = [
    'ytd-app',
    '#content',
    'ytd-page-manager',
    'ytd-watch',
    '#top',
    '#player',
    '#player-container',
    '#movie_player',
    '.videowall-endscreen',
    '.ytp-endscreen-content',
    '.ytp-videowall-still'
  ]

  spiderDOM(path, () => {
    // These elements are re-used as you page thru so be vigilant about stripping them
    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        if (record.addedNodes === 0) return
        stripViewCount(record.target.childNodes[0])
      })
    })

    document.querySelectorAll('.ytp-videowall-still-info-author').forEach((author) => {
      stripViewCount(author.childNodes[0])
      observer.observe(author, { childList: true })
    })
  })
})()

function stripViewCount (textNode) {
  textNode.textContent = textNode.textContent.replace(/\s•\s.*$/, '')
}

/**
 * A partial implementation of a performant DOM-walker that can even handle async
 * loaded elements
 * @param {Array} path
 * @param {Function} onComplete
 */
function spiderDOM (path, onComplete) {
  const options = { childList: true }
  let idx = 0
  let curr = document.querySelector(path[idx++])

  let observer = new MutationObserver(() => {
    let target = curr.querySelector(path[idx])
    if (!target) return

    observer.disconnect()

    do {
      idx += 1
      curr = target
      target = curr.querySelector(path[idx])
    } while (target && idx < path.length)

    if (idx === path.length) {
      onComplete()
    } else {
      observer.observe(curr, options)
    }
  })

  observer.observe(curr, options)
}
