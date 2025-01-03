import { MODULE_ID } from "./config.mjs";
import {foundryCoreVersion} from "./helpers/version-helpers.mjs";
import {LAME} from "./lame.mjs";

export function registerSettings() {
	const isCoreV12orLower = foundryCoreVersion().major < 13;

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

	registerSetting('playNotificationSoundForNewWhisper', {
		name: "LAME.Setting.PlayNotificationSoundForNewWhisper",
		hint: "LAME.Setting.PlayNotificationSoundForNewWhisperHint",
		scope: 'client',
		config: true,
		type: Boolean,
		default: true,
		requiresReload: false,
		onChange: value => {
			game.modules.get(MODULE_ID).instance.settings.playNotificationSound = value;
		}
	});

	registerSetting('buttonInSceneControlToolbar', {
		name: "LAME.Setting.ButtonInSceneControlToolbar",
		hint: "LAME.Setting.ButtonInSceneControlToolbarHint",
		scope: 'client',
		config: isCoreV12orLower,
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
		config: isCoreV12orLower,
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
			await LAME.computeUsersDataAndRenderPartial();
		}
	});

	const usersToExcludeHint = isCoreV12orLower
		? "LAME.Setting.UsersToExcludeHint"
		: "LAME.Setting.UsersToExcludeHintV13preview";
	registerSetting("usersToExclude", {
		name: "LAME.Setting.UsersToExclude",
		// hint: "LAME.Setting.UsersToExcludeHint",
		hint: usersToExcludeHint,
		scope: 'world',
		config: true,
		// inspired by: https://github.com/foundryvtt/dnd5e/blob/6035882315ac6223b33cc512f5f4e1ee2726a95f/module/settings.mjs#L503-L508
		type: new foundry.data.fields.SetField(
			new foundry.data.fields.StringField({
				choices: () => {
					// TODO: Refactor opportunity to use #map.
					let worldUsers = {};
					for (let user of game.users) {
						worldUsers[user.id] = { "label": user.name };
					}
					return worldUsers;
				}
			})
		),
		default: [],
		requiresReload: false,
		onChange: async() => {
			await LAME.computeUsersDataAndRenderPartial();
		}
	});
}

function registerSetting(settingName, options) {
	return game.settings.register(MODULE_ID, settingName, options);
}

export function getSetting(settingName) {
	return game.settings.get(MODULE_ID, settingName);
}
