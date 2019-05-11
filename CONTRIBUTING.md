Welcome, and thank you for your interest in contributing to the world's first Addiction Blocker!

Disengaged is opinionated software. Instead of having a settings page to let users configure behavior, the decisions are already made for them according to a [code of ethics](CODE_OF_ETHICS.md).

All contributions must uphold the code of ethics.

Luckily, the code of ethics is growth-oriented just like the rest of the codebase, so contributions are welcome for it as well.

Think of this repo as two projects in symbiosis. It's a browser plugin to remove addiction dark-patterns; and it's a set of guidelines for sites that wish to proactively avoid addiction dark-patterns in the first place.

There are a few ways to contribute:

## I want to fix a bug

🌹 _Rolls out the red carpet_ 🌹

Thank you! Due to the nature of content scripts, this repo require steady maintenance. It's a community effort to keep everything working.

These efforts are what allow people to continue using the plugin and providing their personal experiences and wisdom toward future improvements.

In short, fixing bugs in this repo is like working in the engine room for a healthier internet.

## I want to add or modify a site

All new scripts must be written to uphold an existing guideline in the code of ethics. The top of the script should specify which guideline it addresses. Follow the format of existing scripts.

If the script you want to make is not covered by the code of ethics, you'll have to first improve the code of ethics.

## I want to improve the code of ethics

Open an issue, start it with `[RFC]` and explain your reasoning.

The most common way to start is with a concrete use case demonstrating what you want to block or unblock, and which is currently incompatible or not covered by the code of ethics.

## Firefox Developer Setup

1. Clone the repo.
2. Add the developer extension to Firefox.
   - visit [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox) and click `Load Temporary Add-on`.
3. Or use [web-ext](#use-web-ext)

Follow the Firefox Extension Workshop tutorial:
<https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/>

### Use web-ext

Speed up browser extension development and make development tasks easier with `web-ext`

<https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/>

      npm install --global web-ext
      web-ext run

This starts Firefox and loads the extension temporarily in the browser

For example, to test the extenstion on Hackernews run this command:

      web-ext run --browser-console --start-url https://news.ycombinator.com

## Chrome Developer Setup

1. Clone the repo.
2. Install [web-ext](#use-web-ext)
3. And run the Extension

   ```
   web-ext run -t chromium --start-url <https://news.ycombinator.com>
   ```
