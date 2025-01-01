import {MODULE_ID} from "../config.mjs";

const fallbackLocale = "en";

export function i18nLongConjunct(text) {
	const conjunctionFormatter = new Intl.ListFormat(computeEffectiveLocale(), {
		style: "long",
		type: "conjunction",
	});

	return conjunctionFormatter.format(text);
}

function computeEffectiveLocale() {
	const locale = game.i18n.lang;
	return isCurrentLocaleAvailableInModule(locale) ? locale : fallbackLocale;
}


function isCurrentLocaleAvailableInModule(locale) {
	const moduleLanguages = game.modules.get(MODULE_ID).languages;
	return !!(moduleLanguages.find(modLang => modLang.lang === locale));
}
