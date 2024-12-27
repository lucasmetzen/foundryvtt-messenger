import { MODULE_ID } from "./config.mjs";
import { log } from "./helpers/log.mjs";

export function registerSettings() {
	registerSetting('showNotificationForNewWhisper', {
		name: "LAME.Setting.ShowNotificationForNewWhisper",
		hint: "LAME.Setting.ShowNotificationForNewWhisperHint",
		scope: 'client',
		config: true,
		type: Boolean,
		default: false,
		requiresReload: false
	});

	registerSetting('permanentNotificationForNewWhisper', {
		name: "LAME.Setting.PermanentNotificationForNewWhisper",
		hint: "LAME.Setting.PermanentNotificationForNewWhisperHint",
		scope: 'client',
		config: true,
		type: Boolean,
		default: false,
		requiresReload: false
	});

	registerSetting('buttonInSceneControlToolbar', {
		name: "LAME.Setting.ButtonInSceneControlToolbar",
		hint: "LAME.Setting.ButtonInSceneControlToolbarHint",
		scope: 'client',
		config: true,
		type: Boolean,
		default: false,
		requiresReload: false,
		onChange: () => {
			window.ui.controls.render();
		}
	});

	registerSetting('buttonInChatControls', {
		name: "LAME.Setting.ButtonInChatControl",
		hint: "LAME.Setting.ButtonInChatControlHint",
		scope: 'client',
		config: true,
		type: Boolean,
		default: true,
		requiresReload: true
	});

	registerSetting('showInactiveUsers', {
		name: "LAME.Setting.ShowInactiveUsers",
		hint: "LAME.Setting.ShowInactiveUsersHint",
		scope: 'client',
		config: true,
		type: Boolean,
		default: false,
		onChange: async() => {
			await window.LAME.computeUsersDataAndRenderPartial();
		}
	});
}

function registerSetting(settingName, options) {
	return game.settings.register(MODULE_ID, settingName, options);
}

export function getSetting(settingName) {
	return game.settings.get(MODULE_ID, settingName);
}
