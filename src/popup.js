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
})();


// ## Helper Functions

function buildDocument() {
  const origin = model.origin;
  const tabState = model.tabState;
  const isSupported = tabState != 3; // aw, man. need a real type system

  setText('domain', origin);
  setVisible('domain', isSupported);
  setVisible('not-supported', !isSupported);

  const optionsBtn = document.getElementById('show-options');
  optionsBtn.addEventListener('click', () => {
    browser.runtime.openOptionsPage();
  });
}

function setVisible(id, visible) {
  document.getElementById(id).classList.toggle('hidden', !visible);
}

function setText(id, text) {
  document.getElementById(id).textContent = text;
}
