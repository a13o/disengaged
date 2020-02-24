/* global browser */

(function init() {
  document.getElementById('toggle-for-site').addEventListener('click', () => {
    browser.runtime.sendMessage({ id: 'toggle' });
  });
})();

browser.runtime
  .sendMessage({ id: 'fetch-url-state' })
  .then((response) => {
    updateHtmlBindings(response);
  });

function updateHtmlBindings(currentState) {
  const $currentSite = document.getElementById('current-site');
  $currentSite.textContent = currentState.domain;

  const $currentState = document.getElementById('current-state');
  $currentState.textContent = `
    supported: ${currentState.supported},
    exists: ${currentState.exists},
    state: ${currentState.state}
  `;
}
