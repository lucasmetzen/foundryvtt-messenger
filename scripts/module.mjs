import {LAME} from "./lame.mjs";
import {getSetting} from "./settings.mjs";
import {localize, MODULE_ICON_CLASSES, MODULE_ID} from "./config.mjs";
import {foundryCoreVersion} from "./helpers/version-helpers.mjs";

Hooks.once('init', LAME.init); // this feels VERY early in Foundry's initialisation...

Hooks.once('ready', async() => {
	const instance = game.modules.get(MODULE_ID).instance;
	instance.computeUsersData(); // TODO: Look into this again as this doesn't seem to be the intended way...
	await instance.populateHistoryFromWorldMessages();
	// TODO: Check if there is a better way for the initial moving of the button to the notification area,
	//  as we just _assume_ the sidebar is collapsed.
	// Initially display button in notification area as sidebar is usually collapsed:
	if (!ui.sidebar.expanded) LAME.onCollapseSidebar(undefined, true);
});

// v12: Add button to scene controls toolbar:
Hooks.on('renderSceneControls', (_controls, html) => {
	if (!getSetting("buttonInSceneControlToolbar") || foundryCoreVersion().major > 12) return;

	const messengerBtn = $(
		`<li class="scene-control control-tool toggle" data-tooltip="LAME.Module.ShortTitle">
			<i class="${MODULE_ICON_CLASSES}"></i>
		</li>`
	);
	messengerBtn[0].addEventListener('click', _event => {
		game.modules.get(MODULE_ID).instance.render();
	});

	html.find('.control-tools').find('.scene-control').last().after(messengerBtn);
});


Hooks.on("collapseSidebar", LAME.onCollapseSidebar);
Hooks.on("changeSidebarTab", LAME.onChangeSidebarTab);

// v13+: Add button to chat controls:
Hooks.on("renderChatLog", async (_app, htmlPassed, _data_ChatInput) => {
	if (foundryCoreVersion().major < 13) return;

	const html = htmlPassed instanceof jQuery ? htmlPassed[0] : htmlPassed,
		instance = game.modules.get(MODULE_ID).instance;

	let messengerBtnHtml = `<div id="lame-messenger-button" class="split-button">
		<button type="button" class="ui-control icon fas fa-comments" data-tooltip="LAME.Module.ShortTitle"
		data-action="TODO" aria-pressed="false" aria-label=""></button>
	</div>`;
	instance.chatbarButton = foundry.applications.parseHTML(messengerBtnHtml);
	instance.chatbarButton.addEventListener('click', async(_event) => {
		await game.modules.get(MODULE_ID).instance.render();
	});

	html.querySelector(".chat-controls").insertAdjacentElement("afterbegin", instance.chatbarButton);
});

// v12: Add button to chat controls:
Hooks.on("renderSidebarTab", async (app, html, _data) => {
	if (foundryCoreVersion().major > 12) return;

	if (app.tabName !== "chat" || !getSetting("buttonInChatControls")) return;

	const messengerBtn = $(
		`<a aria-label="${localize("LAME.Module.ShortTitle")}" role="button" class="lame-messenger" data-tooltip="LAME.Module.ShortTitle">
			<i class="${MODULE_ICON_CLASSES}"></i>
		</a>`
	);
	messengerBtn[0].addEventListener('click', async (_event) => {
		await game.modules.get(MODULE_ID).instance.render();
	});

	html.find("#chat-controls select.roll-type-select").after(messengerBtn);
});

Hooks.on("createChatMessage", LAME.onCreateChatMessage);

// Update internal player list when user (dis)connects:
Hooks.on('userConnected', LAME.computeUsersDataAndRenderPartial);
