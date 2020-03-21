/* global browser */

// ## Constants

const GLOBAL_SCRIPTS = [
  'src/_loaded.js',
  'src/_utils.js',
];

const CONTENT_SCRIPTS = [
  {
    matches: '*://*.news.ycombinator.com/*',
    folder: 'src/hacker-news',
    files: [
      'collapse-deep-comments.js',
      'collapse-low-quality-comments.js',
      'remove-comment-count.css',
      'remove-comment-karma.css',
      'remove-post-karma.css',
      'remove-profile-karma.css',
      'remove-self-karma.js'
    ]
  },
  {
    matches: '*://*.twitter.com/*',
    allFrames: true,
    folder: 'src/twitter',
    files: [
      'remove-comment-count.css',
      'remove-deep-comments.css',
      'remove-follow-count.css',
      'remove-infinite-comments.css',
      'remove-like-count.css',
      'remove-related.css',
      'remove-retweet-count.css',
      'remove-trending.css',
      'remove-view-count.css',
      'remove-vote-count.css'
    ]
  },
  {
    matches: '*://*.youtube.com/*',
    excludeMatches: [
      '*://*.gaming.youtube.com/*',
      '*://*.music.youtube.com/*'
    ],
    allFrames: true,
    folder: 'src/youtube',
    files: [
      'disable-autoplay.js',
      'remove-comment-count.js',
      'remove-deep-comments.css',
      'remove-infinite-comments.css',
      'remove-live-views.css',
      'remove-subscribers.css',
      'remove-suggested-videos.css',
      'remove-suggested-videos.js',
      'remove-view-count.css',
      'remove-votes.css'
    ]
  },
  {
    matches: '*://*.gaming.youtube.com/*',
    allFrames: true,
    folder: 'src/youtube-gaming',
    files: [
      'remove-deep-comments.css',
      'remove-infinite-comments.css',
      'remove-live-views.css',
      'remove-view-count.css',
      'remove-votes.css'
    ]
  },
  {
    matches: '*://*.music.youtube.com/*',
    allFrames: true,
    folder: 'src/youtube-music',
    files: [
      'remove-view-count.css',
      'remove-view-count.js'
    ]
  },
  {
    matches: '*://*.reddit.com/r/*',
    allFrames: true,
    folder: 'src/reddit',
    files: [
      'remove-post-points.css',
      'remove-comment-points.css',
      'remove-comment-count.css',
      'remove-comment-points.js'
    ]
  }
];

/**
 * @typedef {number} IconState
 * @enum {IconState}
 */
const IconState = {
  SUPPORTED: 0,
  NEEDS_PERMISSION: 1,
  NEEDS_REFRESH: 2,
  NOT_SUPPORTED: 3,
};

/**
 * Used by `matchPatternToRegExp` to memoify `_matchPatternToRegExp`
 * @type {Object.<string, string>}
 */
let matchPatternCache = {};


// ## Entry point

(function main() {
  browser.tabs.onUpdated.addListener(onTabUpdated);

  browser.browserAction.onClicked.addListener(function () {
    // todo: a nice popup page with a button that loads the options. this page
    //  can also tell the user if the current site is supported

    browser.runtime.openOptionsPage();
  });
})();

/**
 * @param {number} tabId 
 * @param {object} changeInfo 
 * @param {tabs.Tab} tab 
 */
function onTabUpdated(tabId, changeInfo, tab) {
  // Wait for tabs to be done loading before doing anything
  if (tab.status !== 'complete') { return; }

  const origin = (new URL(tab.url)).origin;
  const foundPerm = findPermissionForOrigin(origin);

  Promise.all([
    foundPerm,
    queryForApproved(foundPerm),
    queryForInjected(tabId),
  ]).then((results) => {
    const [permission, approved, injected] = results;

    let iconState = IconState.NOT_SUPPORTED;

    if (permission && !approved && injected) {
      // todo: they must have revoked the permission. give them some context in
      // the popup, as well as a reload page button
      iconState = IconState.NEEDS_REFRESH;
    } else if (permission && !approved && !injected) {
      iconState = IconState.NEEDS_PERMISSION;
    } else if (permission && approved && !injected) {
      insertScripts(permission, tabId);
      iconState = IconState.SUPPORTED;
    } else if (permission && approved && injected) {
      iconState = IconState.SUPPORTED;
    }

    // The icon should always reflect the active tab
    if (tab.active) {
      updateIcon(iconState);
    }
  });
}


// ## Helper Functions

/**
 * @param {string} permission
 * @returns {Promise<boolean>} user has granted the host permission or not
 */
function queryForApproved(permission) {
  return new Promise((resolve) => {
    if (permission) {
      browser.permissions.contains({
        origins: [permission],
      }).then(resolve);
    } else {
      resolve(false);
    }
  });
}

/**
 * Rather than use this whole ping/pong system, can it just remember the tab
 * ids? Need to read how browsers assign tab ids.
 * @param {number} tabId
 * @returns {Promise<boolean>} tab already has scripts injected or not
 */
function queryForInjected(tabId) {
  return new Promise((resolve) => {
    browser.tabs.sendMessage(tabId, { v : 1 }).then((loaded) => {
      resolve(!!loaded);
    }).catch(() => {
      resolve(false);
    });
  });
}

/**
 * @param {IconState} iconState
 */
function updateIcon(iconState) {
  let badgeText = null; // falsey text 'hides' the badge entirely
  let badgeColor = null; // default color is red
  let colorIcon = true;

  switch (iconState) {
  case IconState.SUPPORTED:
    break;
  case IconState.NEEDS_PERMISSION:
    badgeText = '✚';
    badgeColor = [0, 217, 0, 255];
    break;
  case IconState.NEEDS_REFRESH:
    badgeText = '!';
    break;
  default:
  case IconState.NOT_SUPPORTED:
    colorIcon = false;
    break;
  }

  let title = 'Disengaged';
  if (badgeText) {
    title += ` (${badgeText})`;
  }
  browser.browserAction.setTitle({ title });

  // Mobile Firefox doesn't support icons
  if (browser.browserAction.setIcon) {
    browser.browserAction.setIcon({
      path: colorIcon ? '/icons/icon_48_on.png' : '/icons/icon_48_off.png'
    });
  }

  // Mobile Firefox doesn't support setting badge text or background
  if (browser.browserAction.setBadgeText) {
    browser.browserAction.setBadgeText({ text: badgeText });
    browser.browserAction.setBadgeBackgroundColor({
      color: badgeColor,
    });
  }
}

/**
 * @param {string} hostPermission
 * @param {?number} tabId
 */
function insertScripts(hostPermission, tabId) {
  const siteData = CONTENT_SCRIPTS.find((contentScript) => {
    return contentScript.matches === hostPermission;
  });

  siteData.files
    .filter(file => file.endsWith('.css'))
    .map(file => `/${siteData.folder}/${file}`)
    .map(file => browser.tabs.insertCSS(tabId, {
      allFrames: siteData.allFrames,
      file
    }));

  GLOBAL_SCRIPTS
    .map(file => browser.tabs.executeScript(tabId, {
      file,
    }));

  siteData.files
    .filter(file => file.endsWith('.js'))
    .map(file => `/${siteData.folder}/${file}`)
    .map(file => browser.tabs.executeScript(tabId, {
      allFrames: siteData.allFrames,
      file,
    }));
}

/**
 * @param {?string} origin
 * @returns {?string}
 */
function findPermissionForOrigin(origin) {
  // Special browser tabs such as 'about:debugging' either don't have origins or
  // have a weird 'null' origin.
  if (!origin || origin === 'null') {
    return null;
  }

  const matchingScript = CONTENT_SCRIPTS.find((contentScript) => {
    const regex = matchPatternToRegExp(contentScript.matches);
    // See if it matches the main pattern
    if (regex.test(origin)) {
      // Make sure it isn't in the excludes list
      const excludes = contentScript.excludeMatches;
      const isExcluded = excludes && excludes.some((exclude) => {
        return matchPatternToRegExp(exclude).test(origin);
      });
      if (!isExcluded) {
        return contentScript.matches;
      }
    }
  });
  return matchingScript && matchingScript.matches || null;
}

/**
 * This is a cache around the MDN function
 *
 * @param  {string}  pattern  The pattern to transform.
 * @return {RegExp}           The pattern's equivalent as a RegExp.
 * @throws {TypeError}        If the pattern is not a valid MatchPattern
 */
function matchPatternToRegExp(pattern) {
  if (!matchPatternCache[pattern]) {
    matchPatternCache[pattern] = _matchPatternToRegExp(pattern);
  }
  return matchPatternCache[pattern];
}
/**
 * Transforms a valid match pattern into a regular expression
 * which matches all URLs included by that pattern.
 *
 * This function taken from MDN:
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/match_patterns
 *
 * @param  {string}  pattern  The pattern to transform.
 * @return {RegExp}           The pattern's equivalent as a RegExp.
 * @throws {TypeError}        If the pattern is not a valid MatchPattern
 */
function _matchPatternToRegExp(pattern) {

  if (pattern === '') {
    return (/^(?:http|https|file|ftp|app):\/\//);
  }

  const schemeSegment = '(\\*|http|https|ws|wss|file|ftp)';
  const hostSegment = '(\\*|(?:\\*\\.)?(?:[^/*]+))?';
  const pathSegment = '(.*)';
  const matchPatternRegExp = new RegExp(
    `^${schemeSegment}://${hostSegment}/${pathSegment}$`
  );

  let match = matchPatternRegExp.exec(pattern);
  if (!match) {
    throw new TypeError(`"${pattern}" is not a valid MatchPattern`);
  }

  let [, scheme, host, path] = match;
  if (!host) {
    throw new TypeError(`"${pattern}" does not have a valid host`);
  }

  let regex = '^';

  if (scheme === '*') {
    regex += '(http|https)';
  } else {
    regex += scheme;
  }

  regex += '://';

  if (host && host === '*') {
    regex += '[^/]+?';
  } else if (host) {
    if (host.match(/^\*\./)) {
      regex += '[^/]*?';
      host = host.substring(2);
    }
    regex += host.replace(/\./g, '\\.');
  }

  if (path) {
    if (path === '*') {
      regex += '(/.*)?';
    } else if (path.charAt(0) !== '/') {
      regex += '/';
      regex += path.replace(/\./g, '\\.').replace(/\*/g, '.*?');
      regex += '/?';
    }
  }

  regex += '$';
  return new RegExp(regex);
}
