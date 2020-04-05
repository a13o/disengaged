Welcome, and thank you for your interest in contributing to the world's first Addiction Blocker!

Disengaged is opinionated software. Instead of users configuring the software's behavior, decisions are already made for them according to a [code of ethics](CODE_OF_ETHICS.md).

All contributions must uphold the code of ethics.

Luckily, the code of ethics is growth-oriented just like the rest of the codebase, so contributions are welcome for it as well.

Think of this repo as two projects in symbiosis. It's a browser plugin to remove addiction dark-patterns; and it's a set of guidelines for sites that wish to proactively avoid addiction dark-patterns in the first place.

There are a few ways to contribute:

## I want to fix a bug

Thank you! Due to the nature of content scripts, this repo require steady maintenance. It's a community effort to keep everything working.

In many cases the host site changed their DOM structure or CSS classes and this is preventing the blocking technique from applying itself. Your PR only needs to update the selector(s) that were broken. It's a good idea to use your dev tools to browse the site at different media-query sizes, as this may reveal similar breakages.

## I want to add or modify a site

All new scripts must be written to uphold an existing guideline in the code of ethics. The top of the script should specify which guideline it addresses. Follow the format of existing scripts.

If the script you want to make is not covered by the code of ethics, you'll have to first improve the code of ethics.

## I want to improve the code of ethics

Open an issue, start it with `[RFC]` and explain your reasoning.

The most common way to start is with a concrete use case demonstrating what you want to block or unblock, and which is currently incompatible or not covered by the code of ethics.

## Developer Setup

This project uses [mozilla/web-ext](https://github.com/mozilla/web-ext) for a nice developer experience. It launches a sandbox browser with the extension loaded, and supports livereload. To get set up:

1. Clone the repo.
1. `npm install`

### Firefox Development

1. `npm run start:firefox`

### Firefox for Android Development

1. Configure an Android target by following [Mozilla's setup instructions](https://extensionworkshop.com/documentation/develop/developing-extensions-for-firefox-for-android/#set-up-your-computer-and-android-emulator-or-device).
1. `npm run start:firefox-android`
1. Follow the prompts coming from web-ext. For example, you may need to specify your Android device ID with: `npm run start:firefox-android -- --android-device=<your device ID>`. Note the standalone double hyphen param (`--`) which tells npm to pass subsequent args through to the run script.

### Chrome Development

Chrome is not yet supported. The web-ext tool is compatible with Chrome, but the extension currently uses a `browser` API which is proprietary to Firefox.

### Windows Troubleshooting

The npm scripts should be running `web-ext` from the node_modules folder. You don't need to globally install the package. If npm is unable to find the `web-ext` executable in the project's folder, you may need to set your npm script shell to powershell.

`npm config set script-shell "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe"`
