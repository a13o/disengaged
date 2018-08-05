/* eslint no-unused-vars:0 */
/* global MutationObserver, Node */

function jscss (selector, props) {
  const body = document.getRootNode().body

  let matchCache = body.querySelectorAll(selector)
  matchCache.forEach((elem) => {
    applyStyle(elem, props)
  })

  const observer = new MutationObserver(() => {
    const matches = body.querySelectorAll(selector)

    // Exit early if there are no new items. Also works for the empty case.
    if (matchCache.length === matches.length) {
      let different = false
      for (let k = 0; k < matches.length; k++) {
        different = matches[k] !== matchCache[k]
        if (different) { break }
      }
      if (!different) { return }
    }

    // MutationObservers can trigger themselves recursively so we want to
    // update matchCache now, before we possibly modify elements further.
    const oldMatches = matchCache
    matchCache = matches

    let i
    let j
    let seen

    /**
     * Apply styles to newly ADDED elements.
     * Optimization ideas:
     * 1. Shrink search space of oldMatches as you match its elements. This is
     *    possible cuz there's no duplicate items.
     */
    for (i = 0; i < matches.length; i++) {
      seen = false
      for (j = 0; j < oldMatches.length; j++) {
        seen = matches[i] === oldMatches[j]
        if (seen) { break }
      }
      if (seen) { continue }
      // From this point forward matches[i] is known to be newly ADDED.
      applyStyle(matches[i], props)
    }

    /**
     * Apply styles to newly REMOVED elements.
     */
    for (j = 0; j < oldMatches.length; j++) {
      seen = false
      for (i = 0; i < matches.length; i++) {
        seen = oldMatches[j] === matches[i]
        if (seen) { break }
      }
      if (seen) { continue }
      // From this point forward oldMatches[i] is known to be newly REMOVED.
      removeStyle(oldMatches[j], props)
    }
  })

  observer.observe(body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['id', 'class']
  })
}

function applyStyle (elem, props) {
  // search/replace text support
  if ('search' in props && 'replace' in props) {
    elem.childNodes.forEach((child) => {
      if (child.nodeType !== Node.TEXT_NODE) { return }
      child.textContent = child.textContent.replace(props.search, props.replace)
    })
  }
}

function removeStyle (elem, props) {
  // search/replace text support
  if ('search' in props && 'replace' in props) {
    // No way to undo
  }
}
