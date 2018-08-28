/* global browser */

let currentDomain;
let currentUrlKey;
let currentState;

(function init() {
  document.getElementById('toggle-for-site').addEventListener('click', (e) => {
    browser.runtime.sendMessage({ id: 'toggle' });
  });
})();

browser.tabs
  .query({ active: true, currentWindow: true })
  .then((tabs) => {
    currentDomain = getDomainFromUrl(tabs[0].url);
    return browser.runtime.sendMessage({ id: 'fetch-url-key', url: currentDomain });
  })
  .then((response) => {
    currentUrlKey = response;
    return browser.storage.local.get();
  })
  .then((localStorage) => {
    currentState = fetchUrlState(currentUrlKey, localStorage);
    updateHtmlBindings();
  });

function updateHtmlBindings() {
  const $currentSite = document.getElementById('current-site');
  $currentSite.textContent = currentDomain;

  const $currentState = document.getElementById('current-state');
  $currentState.textContent = `${currentState.supported} ${currentState.exists} ${currentState.state}`;
}

// ## Helper Functions

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
function fetchUrlState(urlKey, localStorage) {
  return {
    supported: !!urlKey,
    exists: localStorage.hasOwnProperty(urlKey),
    state: !!localStorage[urlKey],
  };
}

function getDomainFromUrl(url) {
  const a = document.createElement('a');
  a.setAttribute('href', url);
  return `${a.protocol}//${a.hostname}`;
}
