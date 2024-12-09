export const MODULE_ID = "lame-messenger",
	MODULE_ICON_CLASSES = "fas fa-comments",
	CONSOLE_LOG_PREFIX = "LAME Messenger";

const PATH = `modules/${MODULE_ID}`,
	TEMPLATE_PATH = `${PATH}/templates`;

export const TEMPLATE_PARTS_PATH = `${TEMPLATE_PATH}/parts`;

export function localize(stringId) {
	return game.i18n.localize(stringId);
}
