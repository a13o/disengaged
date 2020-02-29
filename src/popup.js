/* global browser */

(function init() {
  sendMessageFromButton('toggle-for-site', 'toggle');

  let cacheState;

  document.getElementById('register-site').addEventListener('click', () => {
    browser.permissions
      .request({
        origins: [cacheState.matchingSite],
      })
      .then((response) => {
        if (response) {
          browser.runtime.sendMessage({ id: 'toggle' });
        }
      });
  });

  updateState().then((state) => {
    cacheState = state;
  });
})();

function updateState() {
  return new Promise((resolve, reject) => {
    browser.runtime
      .sendMessage({ id: 'fetch-url-state' })
      .then((response) => {
        updateHtmlBindings(response);
        resolve(response);
      })
      .catch(reject);
  });
}

function updateHtmlBindings(currentState) {
  const isSupported = currentState.supported;
  const shouldShowPerm = currentState.supported && !currentState.state;

  setText('domain', currentState.domain);

  setVisible('not-supported', !isSupported);
  setVisible('first-time', shouldShowPerm);
  setVisible('toggle-for-site', isSupported && !shouldShowPerm);
  setVisible('register-site', shouldShowPerm);

  setText('current-state', `
    supported: ${currentState.supported},
    exists: ${currentState.exists},
    state: ${currentState.state}
  `);
}

function sendMessageFromButton(id, message) {
  document.getElementById(id).addEventListener('click', () => {
    browser.runtime.sendMessage({ id: message });
  });
}

function setVisible(id, visible) {
  document.getElementById(id).classList.toggle('hidden', !visible);
}

function setText(id, text) {
  document.getElementById(id).textContent = text;
}
