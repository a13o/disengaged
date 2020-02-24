/* global browser */

// ## Constants

const GLOBAL_SCRIPTS = [
  'src/_utils.js'
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

let isEnabled = true;
let registeredContentScripts = [];
let matchPatternCache = {};


// ## WebExtension Hooks

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.id) {
  case 'toggle':
    toggle();
    return;
  case 'fetch-url-state':
    fetchUrlState(sendResponse);
    return true; // keeps sendResponse channel open
  }
});


// ## Entry point

(function main() {
  updateIcon();
  updateContentScripts();
})();


// ## Helper Functions

function fetchUrlState(sendResponse) {
  let currentDomain;
  let matchingSite;
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then((tabs) => {
      currentDomain = getDomainFromUrl(tabs[0].url);
      matchingSite = findMatchingSiteForDomain(currentDomain);

      return browser.storage.local.get();
    })
    .then((localStorage) => {
      const currentState = lookupStoredUrlState(matchingSite, localStorage);
      currentState.domain = currentDomain;
      sendResponse(currentState);
    });
}

function getDomainFromUrl(url) {
  const a = document.createElement('a');
  a.setAttribute('href', url);
  return `${a.protocol}//${a.hostname}`;
}

function findMatchingSiteForDomain(domain) {
  const matchingScript = CONTENT_SCRIPTS.find((contentScript) => {
    const regex = matchPatternToRegExp(contentScript.matches);
    // See if it matches the main pattern
    if (regex.test(domain)) {
      // Make sure it isn't in the excludes list
      const excludes = contentScript.excludeMatches;
      const isExcluded = excludes && excludes.some((exclude) => {
        return matchPatternToRegExp(exclude).test(domain);
      });
      if (!isExcluded) {
        return contentScript.matches;
      }
    }
  });
  return matchingScript && matchingScript.matches;
}

function toggle() {
  isEnabled = !isEnabled;
  updateIcon();
  updateContentScripts();
  browser.tabs.reload();
}

function updateIcon() {
  browser.browserAction.setTitle({
    title: `Disengaged (${isEnabled ? 'on' : 'off'})`
  });

  // Mobile Firefox doesn't support setIcon
  if (!browser.browserAction.setIcon) { return; }
  browser.browserAction.setIcon({
    path: isEnabled ? 'icons/icon_48_on.png' : 'icons/icon_48_off.png'
  });
}

function updateContentScripts() {
  isEnabled ? registerContentScripts() : unregisterContentScripts();
}

function unregisterContentScripts() {
  registeredContentScripts.forEach(rcs => rcs.unregister());
  registeredContentScripts = [];
}

function registerContentScripts() {
  // todo: browser.storage.sync.get(), only register scripts for enabled sites
  CONTENT_SCRIPTS.forEach((contentScript) => {
    browser.contentScripts.register({
      matches: [contentScript.matches],
      excludeMatches: contentScript.excludeMatches,
      allFrames: !!contentScript.allFrames,
      css: contentScript.files
        .filter(file => file.match(/.*\.css$/))
        .map((file) => { return { file: `${contentScript.folder}/${file}` }; }),
      js: [].concat(
        GLOBAL_SCRIPTS
          .map((file) => { return { file }; }),
        contentScript.files
          .filter(file => file.match(/.*\.js$/))
          .map((file) => { return { file: `${contentScript.folder}/${file}` }; })
      )
    }).then((rcs) => {
      registeredContentScripts.push(rcs);
    });
  });
}

/**
 * If the url is not supported, the plugin does not modify the site.
 * Returns { supported: false, exists: false, state: false }.
 *
 * If the url is not present in storage, this is the first time visiting the url.
 * Returns { supported: true, exists: false, state: false }
 *
 * If the url is in storage, return whether the plugin is enabled or not.
 * Returns { supported: true, exists: true, state: true|false }
 *
 * @param {String} urlKey the `matches` key from the content scripts config
 * @param {browser.storage.StorageArea} localStorage
 * @return {{ supported: Boolean, exists: Boolean, state: Boolean }}
 */
function lookupStoredUrlState(urlKey, localStorage) {
  return {
    supported: !!urlKey,
    exists: localStorage.hasOwnProperty(urlKey),
    state: !!localStorage[urlKey],
  };
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
