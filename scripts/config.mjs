// TODO: Move most of these to `constants` file.
export const MODULE_ID = "lame-messenger",
	CONSOLE_LOG_PREFIX = "LAME Messenger";

const PATH = `modules/${MODULE_ID}`;

export const TEMPLATE_PATH = `${PATH}/templates`,
	SUB_TEMPLATE_PATH = `${TEMPLATE_PATH}/sub-templates`;

// TODO: Extract to another helper file.
export function localize(stringId) {
	return game.i18n.localize(stringId);
}
