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

let matchPatternCache = {};


// ## Entry point

(function main() {
  let enabled = false;
  let activeHostPermission = null;

  updateIcon(enabled);

  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!tab.active) { return; }

    // Clears activeHostPermission until the page is done loading
    activeHostPermission = null;

    if (tab.status !== 'complete') { return; }

    const activeUrl = new URL(tab.url);
    if (activeUrl.origin && activeUrl.origin !== 'null') {
      activeHostPermission = findMatchingSiteForOrigin(activeUrl.origin);
    }

    queryForInjected(tabId).then((alreadyInjected) => {
      enabled = alreadyInjected;
      updateIcon(enabled);
    });
  });
  
  browser.browserAction.onClicked.addListener(() => {
    if (!activeHostPermission) { return; }

    browser.permissions.request({
      origins: [activeHostPermission],
    }).then((approved) => {
      if (approved) {
        enabled = !enabled;
        updateIcon(enabled);
        if (enabled) {
          insertScripts(activeHostPermission);
        } else {
          browser.tabs.reload();
        }
      }
    });
  });
})();


// ## Helper Functions

/**
 * @returns {Promise}
 * @resolves {Boolean}
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

function updateIcon(enabled) {
  browser.browserAction.setTitle({
    title: `Disengaged (${enabled ? 'on' : 'off'})`
  });

  // Mobile Firefox doesn't support setIcon
  if (!browser.browserAction.setIcon) { return; }
  browser.browserAction.setIcon({
    path: enabled ? '/icons/icon_48_on.png' : '/icons/icon_48_off.png'
  });
}

function insertScripts(hostPermission) {
  const siteData = CONTENT_SCRIPTS.find((contentScript) => {
    return contentScript.matches === hostPermission;
  });

  siteData.files
    .filter(file => file.endsWith('.css'))
    .map(file => `/${siteData.folder}/${file}`)
    .map(file => browser.tabs.insertCSS({
      allFrames: siteData.allFrames,
      file
    }));

  GLOBAL_SCRIPTS
    .map(file => browser.tabs.executeScript({
      file,
    }));

  siteData.files
    .filter(file => file.endsWith('.js'))
    .map(file => `/${siteData.folder}/${file}`)
    .map(file => browser.tabs.executeScript({
      allFrames: siteData.allFrames,
      file,
    }));
}

function findMatchingSiteForOrigin(origin) {
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
  return matchingScript && matchingScript.matches;
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
