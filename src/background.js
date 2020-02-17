/* global browser */

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
let registeredContentScripts = []

;(function main () {
  updateIcon();
  updateContentScripts();
})();

browser.browserAction.onClicked.addListener(() => {
  isEnabled = !isEnabled;
  updateIcon();
  updateContentScripts();
  browser.tabs.reload();
});

function updateIcon () {
  browser.browserAction.setTitle({
    title: `Disengaged (${isEnabled ? 'on' : 'off'})`
  });

  // Mobile Firefox doesn't support setIcon
  if (!browser.browserAction.setIcon) { return; }
  browser.browserAction.setIcon({
    path: isEnabled ? 'icons/icon_48_on.png' : 'icons/icon_48_off.png'
  });
}

function updateContentScripts () {
  isEnabled ? registerContentScripts() : unregisterContentScripts();
}

function unregisterContentScripts () {
  registeredContentScripts.forEach(rcs => rcs.unregister());
  registeredContentScripts = [];
}

async function registerContentScripts () {
  CONTENT_SCRIPTS.forEach((contentScript) => {
    contentScript.files
        .filter(file => file.match(/.*\.css$/))
        .map(file => `${contentScript.folder}/${file}`)
        .map(file => browser.tabs.insertCSS(null, { file }));

    GLOBAL_SCRIPTS.map(file => browser.tabs.executeScript(null, { file }));
    contentScript.files
      .filter(file => file.match(/.*\.js$/))
      .map(file => `${contentScript.folder}/${file}`)
      .map(file => browser.tabs.executeScript(null, { file }))

    browser.contentScripts.register({
      matches: [contentScript.matches],
      excludeMatches: contentScript.excludeMatches,
      allFrames: !!contentScript.allFrames,
    }).then((rcs) => {
      registeredContentScripts.push(rcs);
    });
  });
}