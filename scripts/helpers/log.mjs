import { TITLE_ABBREVIATION } from "../config.mjs";

// At this stage, game.i18n has not been populated, so we can't use #localize yet.
// consider: https://foundryvtt.com/api/functions/hookEvents.i18nInit.html
const CONSOLE_MESSAGE_PRESET = [`%c${TITLE_ABBREVIATION}%c |`, 'background: #8000ff; color: #fff', 'color: #fff'];

export function log(...args) {
	console.log(...CONSOLE_MESSAGE_PRESET, ...args);
}
