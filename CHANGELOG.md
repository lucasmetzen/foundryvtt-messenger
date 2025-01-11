# Lucas's Awesome Messenger Extension, or short: LAME Messenger

## 4.3.3 (2025-01-11)
### Maintenance
- Fix showing "no users to show" hint (which broke with refactoring in version 4.3.3)
- Decrease the window height if no users are shown

## 4.3.2 (2025-01-07)
### Maintenance
- Fix history listing `unknown` sender if user was disconnected or set to be excluded while history was populated (when current user logged in or refreshed browser).
- Change module's icon to its outlined counterpart in order to avoid confusion with Foundry VTT's chat button in the UI.

## 4.3.1 (2025-01-04)
### Improvements
- Improve handling and visual identification of incoming and outgoing whispers with multiple recipients

### Maintenance
- Prevent full redraw (which clears user selection and new message input) if window is open

## 4.3.0 (2025-01-04): Foundry VTT v13 support
### Improvements
- ✨ Add support for UI changes in Foundry VTT v13
  - Core v13 introduces changes to the UI which prevented LAME Messenger from adding the button to open its window. This is fixed (tested on the latest `13.334`).
  - The button to open the LAME Messenger window is always visible. (see [release note](https://github.com/lucasmetzen/foundryvtt-messenger/releases/tag/4.2.0) for screenshots and details).
  - The _option_ to not add the button the UI or not has been removed.
  - As the button in/next to the sidebar is always accessible, the option to add a second one to the scene controls toolbar on the left side of the screen is not available starting with Core v13. It is still available in v12.
- Additional filtering of system generated whisper messages: both welcome messages in new worlds, `Getting Started` and `Inviting Your Players`, are now ignored by LAME and will not show up in its history.

### Known issue in v13

In the current preview version of v13 (namely `13.334`), there seem to be changes under way to the  `SetField` type which is used in the configuration to select users to be excluded in LAME. This causes the users to be listed by their ID instead of their name.  
To avoid premature work fixing this, this won't be worked on until a more stable version of v13 is released.  
The feature to exclude users still works though (if you know the user's ID or by trial and error).

### Maintenance

- Refactoring work has begun in order to make the code easier to adjust to future changes and additions, as well as adhere more to best practices for Foundry modules.

## 4.2.0 (2025-01-01): New Year's Edition
### Improvements
- Populate Messenger's in-memory history from world's messages when user logs in or reloads the browser page (triggered by the `ready` hook)
- Add world-wide GM setting to exclude users as recipients
- When history is populated, whispers not received today will display their respective date along with the time

### Translation
- `whisper` messages are now called `Wisper` in German instead of the unwieldy `Flüsternachricht`

### Documentation
- Add a link to the README to directly create a new `filter request` GitHub issue (in case you want to report a game system's private message that should be ignored by LAME Messenger)

## 4.1.2 (2024-12-30)
### Improvements
- Scroll history to bottom when receiving whisper
- Make playing notification sound optional

### Styling
- Standardise scene control button's tooltip styling

## 4.1.1 (2024-12-28)
### Improvement
- Add customisable keybinding to open Messenger window

## 4.1.0 (2024-12-28)
### Improvements
- Add German localisation
- Change prioritisation of error messages when trying to send an empty message while not having selected any recipients

## 4.0.1-4.0.4 (2024-12-26)
- Post-release check fixes (mainly for corrupted binary files due to incorrect CRLF settings in Git)
- 4.0.4: first version to be added to official package listing after module got approved

## 4.0.0 (2024-12-26)
First public release and submission to Foundry VTT package listing
- Bump version number to avoid potential issues with pre-release version numbering
- Add GitHub workflow step to publish release to package page

## Pre-releases 3.0.0-alpha to -kappa (November and December 2024)
Multiple pre-releases on the road to public release
- Foundry VTT v12 minimum

### Improvements
- Migration to Application v2, and improve sub-templates to match
- Add settings for whisper notification
- Add settings for UI buttons to open messenger window
- Rename module from `Lucas's Almost Magnificent Messenger` to `Lucas's Awesome Messenger Extension` and introduce `LAME Messenger` abbreviation
- Improve overall styling
- Add GitHub workflow to create module files for release
- Add README

---

# Lucas's Almost Magnificent Messenger: versions prior to "modern" development

## 2.1.3 (July 2021)
- Foundry VTT v0.8.8 compatibility
- Initial Git commit

## 2.1.2 (April 2021)
Foundry VTT v0.7.9 minimum

## 1.3.1 (December 2020)
Foundry VTT v0.7.7 minimum

## 1.3.0 (March 2020)
Foundry VTT v0.5.1 minimum

## 1.0.0
Lost in the ~~map~~ fog of time...
