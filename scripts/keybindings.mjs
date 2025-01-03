import {localize, MODULE_ID} from "./config.mjs";
import {LAME} from "./lame.mjs";

export function registerKeybindings() {
	registerKeybinding("openMessengerWindow", {
		name: localize("LAME.Keybinding.OpenMessengerWindow"),
		hint: localize("LAME.Keybinding.OpenMessengerWindowHint"),
		// TODO: Add "focus/bring to foreground if open".
		editable: [
			{
				key: "KeyM",
				modifiers: ["Control"]
			}
		],
		onDown: async() => {
			await LAME.show();
			return true; // Consume event and prevent execution of other keybind actions.
		},
		precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
	});
}

function registerKeybinding(action, data) {
	return game.keybindings.register(MODULE_ID, action, data);
}
