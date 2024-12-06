export const MODULE_ID = "lucas-messenger",
	MODULE_ABBREVIATION = "LAME";

const PATH = `modules/${MODULE_ID}`;

export const TEMPLATE_PATH = `${PATH}/templates`,
	TEMPLATE_PARTS = {
		history: `${TEMPLATE_PATH}/history.hbs`,
	};

export function localize(stringId) {
	return game.i18n.localize(stringId);
}
