import {LAME, Lame} from "./lame.mjs";
import {log} from "./helpers/log.mjs";

Hooks.once('init', LAME.init);

Hooks.once('setup', () => {
	Hooks.on("createChatMessage", Lame.onCreateChatMessage);
	Hooks.on('userConnected', Lame.computeUsersDataAndRenderPartial); // Update internal user list when user (dis)connects.
	Hooks.on('clientSettingChanged', Lame.onClientSettingChanged);

	if (game.release.generation < 13) {
		Hooks.on('renderSceneControls', Lame.onRenderSceneControlsV12);
		Hooks.on("renderSidebarTab", Lame.onRenderSidebarTabV12);
	} else {
		Hooks.on("changeSidebarTab", Lame.onChangeSidebarTab);
		Hooks.on("collapseSidebar", Lame.onCollapseSidebar);
	}
})

Hooks.once('ready', async () => {
	await Lame.onReady();
	// Can't be registered as Hooks.once('ready', Lame.onReady), as Lame is not yet initialised.
});
