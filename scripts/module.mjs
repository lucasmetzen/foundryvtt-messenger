import {LAME, Lame} from "./lame.mjs";
import {getSetting} from "./settings.mjs";
import {MODULE_ICON_CLASSES} from "./config.mjs";
import {log} from "./helpers/log.mjs";

Hooks.once('init', LAME.init);

Hooks.once('ready', async () => {
	Lame.computeUsersData();
	await Lame.populateHistoryFromWorldMessages();

	Hooks.on("collapseSidebar", Lame.onCollapseSidebar);
	Hooks.on("changeSidebarTab", Lame.onChangeSidebarTab);
	Hooks.on("createChatMessage", Lame.onCreateChatMessage);
	Hooks.on('userConnected', Lame.computeUsersDataAndRenderPartial); // Update internal user list when user (dis)connects.
	Hooks.on('clientSettingChanged', Lame.onClientSettingChanged);

	if (game.release.generation > 12) {
		const settingPipOrCards = game.settings.get('core', 'uiConfig').chatNotifications; // "cards" | "pip" (default)
		if (settingPipOrCards === 'cards') {
			// TODO: Check if there is a better way for the initial adding of the button to the notification area.
			//   Could use `renderChatLog` (or check if e.g. `renderChatNotification` exists). But I'd say it's fine for now.
			// Initial display button in notification area if sidebar is collapsed:
			if (!ui.sidebar.expanded) Lame.onCollapseSidebar(undefined, true);
		} else {
			Lame.addOpenerButtonToNotificationAreaAsStandalone();
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
		await Lame.show();
	});

	html.find('.control-tools').find('.scene-control').last().after(scenecontrolButton);
	log('renderSceneControls > button added')
});

// v12: Add button to chat controls:
Hooks.on("renderSidebarTab", async (app, html, _data) => {
	if (game.release.generation > 12) return;

	if (app.tabName !== "chat" || !getSetting("buttonInChatControls")) return;

	html.find("#chat-controls select.roll-type-select").after(Lame.ui.openerButton);
});
