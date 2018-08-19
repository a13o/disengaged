/* global browser */

document.getElementById('toggle-for-site').addEventListener('click', (e) => {
  browser.runtime.sendMessage('toggle');
});
