/* global browser */

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
      'remove-infinite-comments.js',
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
      'remove-infinite-comments.js',
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
  }
]

let isEnabled = true
let registeredContentScripts = []

;(function main () {
  updateIcon()
  updateContentScripts()
})()

browser.browserAction.onClicked.addListener(() => {
  isEnabled = !isEnabled
  updateIcon()
  updateContentScripts()
  browser.tabs.reload()
})

function updateIcon () {
  browser.browserAction.setIcon({
    path: isEnabled ? 'icons/icon_48_on.png' : 'icons/icon_48_off.png'
  })
  browser.browserAction.setTitle({
    title: `Disengaged - Attention Blocker (${isEnabled ? 'on' : 'off'})`
  })
}

function updateContentScripts () {
  isEnabled ? registerContentScripts() : unregisterContentScripts()
}

function unregisterContentScripts () {
  registeredContentScripts.forEach(rcs => rcs.unregister())
  registeredContentScripts = []
}

async function registerContentScripts () {
  CONTENT_SCRIPTS.forEach((contentScript) => {
    browser.contentScripts.register({
      matches: [contentScript.matches],
      excludeMatches: contentScript.excludeMatches,
      allFrames: !!contentScript.allFrames,
      css: contentScript.files
        .filter(file => file.match(/.*\.css$/))
        .map((file) => { return { file: `${contentScript.folder}/${file}` } }),
      js: contentScript.files
        .filter(file => file.match(/.*\.js$/))
        .map((file) => { return { file: `${contentScript.folder}/${file}` } })
    }).then((rcs) => {
      registeredContentScripts.push(rcs)
    })
  })
}
