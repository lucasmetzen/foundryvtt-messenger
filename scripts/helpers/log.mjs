import { TITLE_ABBREVIATION } from "../config.mjs";

const CONSOLE_MESSAGE_PRESET = [`%c${TITLE_ABBREVIATION}%c |`, 'background: #8000ff; color: #fff', 'color: #fff']; // see chat-images\scripts\utils.js

export function log(...args) {
	console.log(...CONSOLE_MESSAGE_PRESET, ...args);
}
