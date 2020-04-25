/* global browser */


// ## Local State

/** @type {PopupConfig} */
let model = null;


// ## Entry Point

(function main() {
  browser.runtime.sendMessage({
    msg: 'GET v1/popup/config',
  }).then((response) => {
    model = response;
    buildDocument();
  });
})();


// ## Helper Functions

function buildDocument() {
  const origin = model.origin;
  const tabState = model.tabState;
  const isSupported = tabState != 3; // aw, man. need a real type system
  const needsRefresh = tabState === 2;

  setText('domain', origin);
  setVisible('domain', isSupported);
  setVisible('supported', isSupported);
  setVisible('not-supported', !isSupported);
  setVisible('needs-refresh', needsRefresh);

  const optionsBtn = document.getElementById('show-options');
  optionsBtn.addEventListener('click', () => {
    browser.runtime.openOptionsPage()
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.log('Failed to open options page:', error);
      });
  });
}

function setVisible(id, visible) {
  document.getElementById(id).classList.toggle('hidden', !visible);
}

function setText(id, text) {
  document.getElementById(id).textContent = text;
}
