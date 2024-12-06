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

  log("Module settings registered."); // DEBUG: Remove after development.
}

function registerSetting(settingName, options) {
  return game.settings.register(MODULE_ID, settingName, options);
}

export function getSetting(settingName) {
  return game.settings.get(MODULE_ID, settingName);
}
