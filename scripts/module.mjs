const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

import {MODULE_ID, TEMPLATE_PATH, TEMPLATE_PARTS, localize, SUB_TEMPLATE_PATH} from "./config.mjs";
import { log } from "./helpers/log.mjs";
import { getSetting, registerSettings } from "./settings.mjs";
import { registerHandlebarsHelpers } from "./helpers/handlebars-helpers.mjs";

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
			height: "auto", // If set to `auto`, setting history's height to 100% results in a minimal height.
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
		// Can be access like this: this.constructor.PARTS[partId]
		users: {
			id: "users",
			classes: ["users"],
			template: TEMPLATE_PARTS.users
		},
		history: {
			id: "history", // Neither id nor classes is added, due to the way it is rendered, I think.
			classes: ["history", "chat-elements-part"],
			template: `${SUB_TEMPLATE_PATH}/history.hbs`,
			// template: TEMPLATE_PARTS.history
		},
		messageInput: {
			id: "message-input",
			classes: ["message-input", "chat-elements-part"],
			template: `${SUB_TEMPLATE_PATH}/message-input.hbs`
		}
		/*form: { // "main window"
			// id: "form", // Results in `lame-messenger-form` for the HTML element. Without, there would be 2 `lame-messenger` elements as the application window has the same id.
			// id: "form-id-from-parts", // results in `lame-messenger-form-id-from-parts` for the HTML element
			// classes: ["form-id-from-parts-1", "form-id-from-parts-2"], // classes do get added to the HTML element
			template: `${TEMPLATE_PATH}/messenger.hbs` // The template entry-point for the part
			// templates: [] // An array of templates that are required to render the part. If omitted, only the entry-point is inferred as required.
		}*/
	}

	_onFirstRender(context, options) {
		const chatElements = document.createElement("div");
		chatElements.classList.add("chat-elements");
		chatElements.replaceChildren(...this.element.querySelectorAll(".chat-elements-part"));
		this.element.querySelector(".users").insertAdjacentElement("afterend", chatElements);
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

	/** @inheritDoc */
	// https://github.com/foundryvtt/dnd5e/blob/d3704554f9a1a539a1a3816742f3733c460f210a/module/applications/compendium-browser.mjs#L463
	async _preparePartContext(partId, context, options) {
		await super._preparePartContext(partId, context, options);
		log("_preparePartContext > after super", partId, context, options);
		switch ( partId ) {
			/*case "documentClass":
			case "types":
			case "filters": return this._prepareSidebarContext(partId, context, options);
			case "results": return this._prepareResultsContext(context, options);
			case "footer": return this._prepareFooterContext(context, options);
			case "tabs": return this._prepareTabsContext(context, options);
			case "header": return this._prepareHeaderContext(context, options);*/
			case "history": return "this is the context prepared for history in _preparePartContext.";
		}

		log("_preparePartContext > finished", partId, context, options);
		return context;
	}


	/**
	 * A record of all rendered template parts.
	 * @returns {Record<string, HTMLElement>}
	 * /
	get parts() {
		return this.#parts;
	}
	#parts = {};*/

	#historyTextEntries = ["abc","def"];


	/**
	 * Prepare the results context.
	 * @param {ApplicationRenderContext} context     Shared context provided by _prepareContext.
	 * @param {HandlebarsRenderOptions} options      Options which configure application rendering behavior.
	 * @returns {Promise<ApplicationRenderContext>}  Context data for a specific part.
	 * @protected
	 * /
	async _prepareResultsContext(context, options) {
		// TODO: Determine if new set of results need to be fetched, otherwise use old results and re-sort as necessary
		// Sorting changes alone shouldn't require a re-fetch, but any change to filters will
		const filters = CompendiumBrowser.applyFilters(context.filterDefinitions, context.filters.additional);
		// Add the name filter
		if ( this.#filters.name?.length ) filters.push({ k: "name", o: "icontains", v: this.#filters.name });
		this.#results = CompendiumBrowser.fetch(CONFIG[context.filters.documentClass].documentClass, {
			filters,
			types: context.filters.types,
			indexFields: new Set(["system.source"])
		});
		context.displaySelection = this.displaySelection;
		return context;
	}*/

	_onRender(_context, _options) {
		const html = $(this.element);
		// TODO: try to avoid using jQuery, e.g.:
		// this.element.querySelector("input[name=something]").addEventListener("click", /* ... */);

		html.find('button.send').click(async _event => {
			await this.sendMessage(html);
		});

		html.find('.message').on("keypress", event => this._onKeyPressEvent(event, html));
	}

	static async onSubmit(event, form, formData) {}

	/** @override */
	_configureRenderOptions(options) {
		super._configureRenderOptions(options);
		// Completely overriding the parts
		//options.parts = ['form']; // DEBUG: TEST!
	}

	constructor(app) {
		super(app);
		this.history = [];
	}

	static async init() {
		registerSettings();
		registerHandlebarsHelpers();

		const templatesParts = Object.keys(TEMPLATE_PARTS).map(
			(key) => TEMPLATE_PARTS[key]
		);
		loadTemplates(templatesParts); // TODO: figure out how to do this nicely with Application v2's PARTS
	}

	static setup() {
		window.LAME = new LAME();
	}

	static ready() {
		window.LAME.computeUsersData(); // TODO: Look into this again as this doesn't seem to be the intended way...

		log('ready');
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
		/* const data = { history: this.beautifyHistory() },
			history = await renderTemplate(TEMPLATE_PARTS.history, data);
		$('#lame-messenger .history').val(history);*/

		log("renderHistoryPartial > this", this);
		// context.history = this.beautifyHistory();
		await this.render(false, { parts: ['history'] });
		// await window.LAME.render(false, { parts: ['users']});


		/* https://discord.com/channels/170995199584108546/722559135371231352/1238597872140816576
		calling render with the parts option is the main idea
		this.render(false, {parts: ['composite']});


		You can also use this info in _prepareContext to conditionally prepare heavier datasets.
		if (options.parts.includes('composite')) {
		  context.heavyData = await foo();
		}*/
	}

	async render(...args) {
		/*
		log(...args)
		if (args[0] === true) {
			log("Forcing re-render");
			return super.render(true, ...args);
		} // Force re-render.

		if (!this.rendered) {
			log("Rendering as window is not shown at the moment")
			return super.render(true, ...args);
		}

		log("Not rendering")*/

		log("this.rendered", this.rendered)
		if (!this.rendered) return await super.render(true, ...args);

		await super.render(...args);
/*		async _render(force=false, options={}) {
			await super._render(force, options);*/
	}

	computeUsersData() {
		const showInactiveUsers = getSetting('showInactiveUsers');

		let usersData = [];
		for (let user of game.users) {
			if (user.isSelf || user.isBanned || (user.name === "DM's Helper")) continue;

			// Skip inactive user unless inactive users should be shown:
			if (!user.active && !showInactiveUsers) continue;

			let data = {
				name: user.name,
				id: user.id,
				avatar: user.avatar,
				color: user.color,
				active: user.active // user currently connected
			};
			usersData.push(data);
		}
		window.LAME.users = usersData;
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
		const messageField = html.find('.message'),
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

		if (!this.rendered) return this.render(); // Open window. // TODO: Add option for this.

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

// Update internal player list when user (dis)connects:
Hooks.on('userConnected', async(_user, _connected) => {
	// https://foundryvtt.com/api/functions/hookEvents.userConnected.html
	window.LAME.computeUsersData();
	// TODO: Re-render visual user list in window if it is open.
	await window.LAME.render(false, { parts: ['users']});
});
