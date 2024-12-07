export const MODULE_ID = "lame-messenger",
	CONSOLE_LOG_PREFIX = "LAME Messenger";

const PATH = `modules/${MODULE_ID}`;

export const TEMPLATE_PATH = `${PATH}/templates`,
	SUB_TEMPLATE_PATH = `${TEMPLATE_PATH}/sub-templates`,
	TEMPLATE_PARTS = {
		history: `${SUB_TEMPLATE_PATH}/history.hbs`,
		users: `${SUB_TEMPLATE_PATH}/users.hbs`
	};

export function localize(stringId) {
	return game.i18n.localize(stringId);
}
