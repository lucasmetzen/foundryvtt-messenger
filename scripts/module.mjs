import {LAME} from "./lame.mjs";
import {getSetting} from "./settings.mjs";
import {localize, MODULE_ICON_CLASSES} from "./config.mjs";
import {foundryCoreVersion} from "./helpers/version-helpers.mjs";

Hooks.once('init', LAME.init); // this feels VERY early in Foundry's initialisation...
Hooks.once('ready', LAME.ready);

// v12: Add button to scene controls toolbar:
Hooks.on('renderSceneControls', (_controls, html) => {
	if (!getSetting("buttonInSceneControlToolbar") || foundryCoreVersion().major > 12) return;

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


Hooks.on("collapseSidebar", LAME.onCollapseSidebar);
Hooks.on("changeSidebarTab", LAME.onChangeSidebarTab);

// v13+: Add button to chat controls:
Hooks.on("renderChatLog", async (_app, htmlPassed, _data_ChatInput) => {
	if (foundryCoreVersion().major < 13) return;

	const html = htmlPassed instanceof jQuery ? htmlPassed[0] : htmlPassed;

	let messengerBtnHtml = `<div id="lame-messenger-button" class="split-button">
		<button type="button" class="ui-control icon fas fa-comments" data-tooltip="LAME.Module.ShortTitle"
		data-action="TODO" aria-pressed="false" aria-label=""></button>
	</div>`;
	LAME.chatbarButton = foundry.applications.parseHTML(messengerBtnHtml);
	LAME.chatbarButton.addEventListener('click', _event => {
		window.LAME.render();
	});

	html.querySelector(".chat-controls").insertAdjacentElement("afterbegin", LAME.chatbarButton);
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
	messengerBtn[0].addEventListener('click', _event => {
		window.LAME.render();
	});

	html.find("#chat-controls select.roll-type-select").after(messengerBtn);
});

Hooks.on("createChatMessage", LAME.hookCreateChatMessage);

// Update internal player list when user (dis)connects:
Hooks.on('userConnected', LAME.computeUsersDataAndRenderPartial);
