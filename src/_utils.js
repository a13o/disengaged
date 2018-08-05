/* global MutationObserver, Node */

/**
 * A way to write css-like rules, consistently enforced on a live document.
 *
 * Perform complex string replacement on text inside matching elements. It uses
 * String.prototype.replace under the hood.
 * @example
 * jscss('.full-name', {
 *   search: /(\w+)\s(\w+)/,
 *   replace: '$2, $1'
 * })
 *
 * Only apply the css results on the first set of results. If you know there
 * won't be any further results, this flag can be used to improve performance
 * by telling jscss not to watch the document anymore.
 * @example
 * jscss('.full-name', {
 *   search: /(\w+)\s(\w+)/,
 *   replace: '$2, $1',
 *   firstResultOnly: true
 * })
 *
 * @param {String} selector
 * @param {Object} props
 * @param {RegExp} props.search
 * @param {String} props.replace
 * @param {Boolean} props.firstResultOnly
 */
function jscss (selector, props) { // eslint-disable-line no-unused-vars
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

      // As an optimization, jscss can be requested to apply only once.
      if (props.firstResultOnly) {
        observer.disconnect()
      }
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
  // Search/replace text support
  if ('search' in props && 'replace' in props) {
    addTextObserver(elem, props)
  }
}

function removeStyle (elem, props) {
  // Search/replace text support
  if ('search' in props && 'replace' in props) {
    // Could cache the observers and disconnect them, but no need atm.
  }
}

function addTextObserver (elem, props) {
  searchReplaceChildren(elem, props)

  const observer = new MutationObserver(() => searchReplaceChildren(elem, props))
  observer.observe(elem, {
    childList: true,
    characterData: true
  })
}

function searchReplaceChildren (elem, props) {
  elem.childNodes.forEach((child) => {
    if (child.nodeType !== Node.TEXT_NODE) { return }
    const newStr = child.textContent.replace(props.search, props.replace)
    // Only assign if the value would actually change, since blindly
    // assigning could cause another mutation to be observed.
    if (child.textContent === newStr) { return }
    child.textContent = newStr
  })
}
