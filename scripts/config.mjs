export const MODULE_ID = "lame-messenger",
	MODULE_ICON_CLASSES = "far fa-comments",
	CONSOLE_LOG_PREFIX = "LAME Messenger";

const PATH = `modules/${MODULE_ID}`,
	TEMPLATES_PATH = `${PATH}/templates`;

export const SOUNDS_PATH = `${PATH}/sounds`,
	TEMPLATE_PARTS_PATH = `${TEMPLATES_PATH}/parts`;

export function localize(stringId) {
	return game.i18n.localize(stringId);
}
