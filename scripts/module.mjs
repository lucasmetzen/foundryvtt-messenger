import {LAME} from "./lame.mjs";
import {getSetting} from "./settings.mjs";
import {MODULE_ICON_CLASSES, MODULE_ID} from "./config.mjs";
import {log} from "./helpers/log.mjs";

Hooks.once('init', LAME.init); // this feels VERY early in Foundry's initialisation...

Hooks.once('ready', async () => {
	const instance = game.modules.get(MODULE_ID).instance;
	instance.computeUsersData(); // TODO: Look into this again as this doesn't seem to be the intended way...
	await instance.populateHistoryFromWorldMessages();

	if (game.release.generation > 12) {
		const settingPipOrCards = game.settings.get('core', 'uiConfig').chatNotifications; // "cards" | "pip" (default)
		if (settingPipOrCards === 'cards') {
			// TODO: Check if there is a better way for the initial adding of the button to the notification area.
			//   Could use `renderChatLog` (or check if e.g. `renderChatNotification` exists). But I'd say it's fine for now.
			// Initial display button in notification area if sidebar is collapsed:
			if (!ui.sidebar.expanded) LAME.onCollapseSidebar(undefined, true);
		} else {
			LAME.addChatbarButtonToNotificationAreaAsStandalone();
		}
	}
});

// v12: Add button to scene controls toolbar:
Hooks.on('renderSceneControls', (_controls, html) => {
	if (!getSetting("buttonInSceneControlToolbar") || game.release.generation > 12) return;

	const scenecontrolButtonHtml = `<li class="scene-control control-tool toggle" data-tooltip="LAME.Module.ShortTitle">
				<i class="${MODULE_ICON_CLASSES}"></i>
			</li>`;
	let scenecontrolButton = foundry.applications.parseHTML(scenecontrolButtonHtml);
	scenecontrolButton.addEventListener('click', async (_event) => {
		await game.modules.get(MODULE_ID).instance.show();
	});

	html.find('.control-tools').find('.scene-control').last().after(scenecontrolButton);
	log('renderSceneControls > button added')
});

// v12: Add button to chat controls:
Hooks.on("renderSidebarTab", async (app, html, _data) => {
	if (game.release.generation > 12) return;

	if (app.tabName !== "chat" || !getSetting("buttonInChatControls")) return;

	const chatbarButton = game.modules.get(MODULE_ID).instance.chatbarButton;
	html.find("#chat-controls select.roll-type-select").after(chatbarButton);
});

Hooks.on("collapseSidebar", LAME.onCollapseSidebar);
Hooks.on("changeSidebarTab", LAME.onChangeSidebarTab);
Hooks.on("createChatMessage", LAME.onCreateChatMessage);

// Update internal player list when user (dis)connects:
Hooks.on('userConnected', LAME.computeUsersDataAndRenderPartial);

Hooks.on('clientSettingChanged', LAME.onClientSettingChanged);
