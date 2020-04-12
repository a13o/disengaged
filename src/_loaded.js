/* global browser */

/**
 * A tiny ping to let the Disengaged background script know it already injected
 * blockers into this page.
 */

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  sendResponse(true);
});
