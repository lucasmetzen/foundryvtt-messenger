# Lucas's Awesome Messenger Extension, or short: LAME Messenger

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
