const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

import { MODULE_ID, TEMPLATE_PATH, TEMPLATE_PARTS, localize } from "./config.mjs";
import { log } from "./helpers/log.mjs";
import { getSetting, registerSettings } from "./settings.mjs";

class LAME extends HandlebarsApplicationMixin(ApplicationV2) {

	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		// https://foundryvtt.com/api/v12/interfaces/foundry.applications.types.ApplicationConfiguration.html

		id: MODULE_ID,
		form: {
			handler: LAME.onSubmit,
			closeOnSubmit: false
		},
		position: {
			width: 640,
			height: "auto",
		},
		tag: "form",
		window: {
			icon: "fas fa-comment-dots",
			title: "LAME.Module.TitleWithAbbreviation"
		},
		classes: ['messenger']
	}
	
	/** @override */
	static PARTS = {
		history: {
			// id: "history",
			// template: `${TEMPLATE_PATH}/history.hbs`
			template: TEMPLATE_PARTS.history
		},
		/*users: {
			template: TEMPLATE_PARTS.users
		},*/
		form: { // "main window"
			template: `${TEMPLATE_PATH}/messenger.hbs`
		}
	}

	/** @inheritDoc */
	get title() {
		return localize(this.options.window.title);
	}

	// Provides template with dynamic data:
	/** @override */
	async _prepareContext() {
		return {
			users: this.users,
			history: this.beautifyHistory()
		};
	}

	_onRender(_context, _options) {
		const html = $(this.element);
		// TODO: try to avoid using jQuery, e.g.:
		// this.element.querySelector("input[name=something]").addEventListener("click", /* ... */);

		// Submit/Send button:
		html.find('input[type="submit"]').click(_event => {
			this.sendMessage(html);
		});

		html.find('#lame-messenger .message').on("keypress", event => this._onKeyPressEvent(event, html));
	}

	static async onSubmit(event, form, formData) {}

	/** @override */
	_configureRenderOptions(options) {
		super._configureRenderOptions(options);
		// Completely overriding the parts
		options.parts = ['form'];
	}

	constructor(app) {
		super(app);
		// this.users = this.computeUsersData(); // DEBUG: deactivated for .setup() test
		this.history = [];

		// this.window = new LAMEwindow();
	}

	static async init() {
		registerSettings();

		const templatesParts = Object.keys(TEMPLATE_PARTS).map(
			(key) => TEMPLATE_PARTS[key]
		);
		loadTemplates(templatesParts); // TODO: figure out how to do this nicely with Application v2's PARTS
	}

	static setup() {
		const newLAME = new LAME();
		newLAME.history = [];
		//newLAME.window = new LAMEwindow();
		window.LAME = newLAME;
		log('set up');
	}

	static ready() {
		window.LAME.users = window.LAME.computeUsersData(); // TODO: Look into this again as this doesn't seem to be the intended way...

		log('ready')
	}

	beautifyHistory() {
		// TODO: I think this is called too often and the output should be cached if it isn't already.
		let beautified = [];
		for (let msg of this.history) {
			let toOrFrom = localize(msg[1] === 'in' ? "LAME.History.From" : "LAME.History.To");
			beautified.push(
				msg[0] + // (date &) time
				` ${toOrFrom} ` + // in or out
				this.getUserNameFromId(msg[2]) + ': ' + // User name
				msg[3] // message
			);
		}
		return beautified;
	}

	async renderHistoryPartial() {
		/* return await renderTemplate(TEMPLATES.history, {
			history: this.beautifyHistory()
		}) */

		// await loadTemplates([TEMPLATES.history]);
		// let historyHtml = $(await renderTemplate(TEMPLATES.history, data));

		// log("renderHistoryPartial > window.LAME", window.LAME) // does not contain PARTS
		// this.PARTS is not defined as `this` does not refer to the class instance
		const data = { history: this.beautifyHistory() },
			history = await renderTemplate(TEMPLATE_PARTS.history, data);
		$('#lame-messenger .history').val(history);
	}


	render(...args) {
		if (!this.rendered) return super.render(true, ...args);
	}

	computeUsersData() {
		let usersData = [];
		for (let user of game.users) {
			if (user.isSelf || (user.name === "DM's Helper") || user.isBanned) continue;

			let data = {
				name: user.name,
				id: user.id,
				avatar: user.avatar,
				color: user.color,
				active: user.active // user currently connected
			};
			usersData.push(data);
		}
		return usersData;
	}

	getUserNameFromId(id) {
		// TODO: this is called way too often
		/*log('getUserNameFromId > id', id)
		log('getUserNameFromId > users', window.LAME.users)*/
		return window.LAME.users.find(user => user.id === id).name;
	}

	getUserIdFromName(name) {
		return window.LAME.users.find(user => user.name === name).id;
	}

	sendWhisperTo(userNames, msg) {
		for (let username of userNames) {
			// chatData needs to be defined for each message as the .whisper assignment is not overwritten on subsequent loops,
			// resulting in multiple messages with unique document IDs but to the same recipient.
			let chatData = {
				user: game.user.id,
				content: msg
			};
			chatData.whisper = ChatMessage.getWhisperRecipients(username);
			ChatMessage.create(chatData);
		}
	}

	async _onKeyPressEvent(event, html) {
		if ((event.keyCode === 10) && event.ctrlKey) { // for `#on("keyup")` it's 13 when combined with Ctrl
			await this.sendMessage(html);
		}
	}

	async sendMessage(html) {
		// Get selected users:
		const checkedUserElements = html.find('input[id^="user-"]:checked');
		let selectedUserNames = [];
		checkedUserElements.each(function() {
			selectedUserNames.push(this.id.replace('user-', ''));
		});
		if (selectedUserNames.length === 0) {
			ui.notifications.error(localize("LAME.Notification.NoRecipientSelected"));
			return;
		}

		// Get message text:
		const messageField = html.find('#lame-messenger .message'),
			message = messageField.val();
		if (message.length === 0) {
			ui.notifications.error(localize("LAME.Notification.NoMessageToSend"));
			return;
		}

		// Send whisper(s):
		this.sendWhisperTo(selectedUserNames, message);
		this.addOutgoingMessageToHistory(selectedUserNames, message);
		await this.renderHistoryPartial();

		// Clear message input field for next text:
		messageField.val('');
	}

	async handleIncomingPrivateMessage(data) {
		if (getSetting("showNotificationForNewWhisper")) {
			ui.notifications.info(
				`${localize("LAME.IncomingWhisperFrom")} ${data.author.name}`,
				{ permanent: getSetting("permanentNotificationForNewWhisper") },
			);
		}
	
		this.addIncomingMessageToHistory(data);
		await window.LAME.playNotificationSound();

		if (!this.rendered) return this.render();

		await this.renderHistoryPartial();
	}

	async playNotificationSound() {
		// Unless played via `autoplay`, the sound is not played on `interface` channel/context but on `music`.
		//  This seems to be a bug in Foundry itself.
		//  Therefore, it can not just be created _once_ during initialisation and then #play-ed.
		//  According to browser network inspection, the file is at least not requested multiple times.
		await game.audio.create({
			src: "modules/lame-messenger/sounds/pst-pst.ogg",
			context: game.audio.interface,
			singleton: false,
			preload: true,
			autoplay: true
		});
	}

	currentTime() {
		function padLeadingZero(num) {
			return ('00' + num).slice(-2);
		}

		const date = new Date();
		return padLeadingZero(date.getHours()) + ":" + padLeadingZero(date.getMinutes()) + ":" + padLeadingZero(date.getSeconds());
	}

	addIncomingMessageToHistory(data) {
		const time = this.currentTime();
		// TODO: data.user.id should be replaced by data.author.name and the whole process simplified
		// TODO: data.user is also now deprecated since v12 in favor of data.author.
		this.history.push([time, 'in', data.user.id, data.content]);
	}

	addOutgoingMessageToHistory(recipients, msg) {
		for (const recipient of recipients) {
			const time = this.currentTime();
			this.history.push([time, 'out', this.getUserIdFromName(recipient), msg]);
		}
	}

}

// Add button to scene controls toolbar:
Hooks.on('renderSceneControls', (controls, html) => {
	if (!getSetting("buttonInSceneControlToolbar")) return;

	const messengerBtn = $(
		`<li class="scene-control control-tool toggle">
			<i class="fas fa-comment-dots" title="${localize("LAME.Module.ShortTitle")}"></i>
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
			<i class="fas fa-comment-dots"></i>
		</a>`
	);
	messengerBtn[0].addEventListener('click', _event => {
		window.LAME.render();
	});

	html.find("#chat-controls select.roll-type-select").after(messengerBtn);
});

Hooks.on("createChatMessage", async (data, options, senderUserId) => {
	const isToMe = (data?.whisper ?? []).includes(game.userId),
		isFromMe = senderUserId === game.userId;

	if (!isToMe || isFromMe) return;

	// Ignore private messages to GM that are player's roll results (e.g. Private/Blind GM rolls):
	if (data.rolls.length > 0) return;

	// log('incoming whisper', data, options, senderUserId)
	await window.LAME.handleIncomingPrivateMessage(data);
});

Hooks.once('init', LAME.init); // this feels VERY early in Foundry's initialisation...
Hooks.once('setup', LAME.setup);
Hooks.once('ready', LAME.ready);

/* Hooks.on('renderPlayerList', () => {
	window.LAME.users = window.LAME.computeUsersData(); // update player list when user (dis)connects
} */
