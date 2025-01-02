import {LAME} from "./lame.mjs";
import {getSetting} from "./settings.mjs";
import {localize, MODULE_ICON_CLASSES} from "./config.mjs";

Hooks.once('init', LAME.init); // this feels VERY early in Foundry's initialisation...
Hooks.once('ready', LAME.ready);

// Add button to scene controls toolbar:
Hooks.on('renderSceneControls', (_controls, html) => {
	if (!getSetting("buttonInSceneControlToolbar")) return;

	const messengerBtn = $(
		`<li class="scene-control control-tool toggle" data-tooltip="LAME.Module.ShortTitle">
			<i class="${MODULE_ICON_CLASSES}"></i>
		</li>`
	);
	messengerBtn[0].addEventListener('click', _event => {
		window.LAME.render();
	});

	html.find('.control-tools').find('.scene-control').last().after(messengerBtn);
});

// Add button to chat controls:
Hooks.on("renderSidebarTab", async (app, html, _data) => {
	if (app.tabName !== "chat" || !getSetting("buttonInChatControls")) return;

	const messengerBtn = $(
		`<a aria-label="${localize("LAME.Module.ShortTitle")}" role="button" class="lame-messenger" data-tooltip="LAME.Module.ShortTitle">
			<i class="${MODULE_ICON_CLASSES}"></i>
		</a>`
	);
	messengerBtn[0].addEventListener('click', _event => {
		window.LAME.render();
	});

	html.find("#chat-controls select.roll-type-select").after(messengerBtn);
});

Hooks.on("createChatMessage", LAME.hookCreateChatMessage);

// Update internal player list when user (dis)connects:
Hooks.on('userConnected', LAME.computeUsersDataAndRenderPartial);
