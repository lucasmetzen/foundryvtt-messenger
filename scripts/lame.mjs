const {ApplicationV2, HandlebarsApplicationMixin} = foundry.applications.api;

import {localize, MODULE_ID, MODULE_ICON_CLASSES, TEMPLATE_PARTS_PATH} from "./config.mjs";
import {getSetting, registerSettings} from "./settings.mjs";
import {registerKeybindings} from "./keybindings.mjs";
import {registerHandlebarsHelpers} from "./helpers/handlebars-helpers.mjs";
import {formatDateYYYYMMDD, formatTimeHHMMSS, isToday} from "./helpers/date-time-helpers.mjs";
import {i18nLongConjunct} from "./helpers/i18n.mjs";

export class LAME extends HandlebarsApplicationMixin(ApplicationV2) {

	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		// https://foundryvtt.com/api/v12/interfaces/foundry.applications.types.ApplicationConfiguration.html

		id: MODULE_ID,
		form: {
			handler: LAME.onSubmit,
			closeOnSubmit: false
		},
		position: {
			width: 780,
			height: "auto", // If set to `auto`, setting history's height to 100% results in a minimal height.
		},
		tag: "form",
		window: {
			icon: MODULE_ICON_CLASSES,
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
			template: `${TEMPLATE_PARTS_PATH}/users.hbs`
		},
		history: {
			id: "history",
			classes: ["history", "chat-elements-part"],
			template: `${TEMPLATE_PARTS_PATH}/history.hbs`,
		},
		messageInput: {
			id: "message-input",
			classes: ["message-input", "chat-elements-part"],
			template: `${TEMPLATE_PARTS_PATH}/message-input.hbs`
		}
	}

	/**
	 * The button in the chat sidebar to open the Messenger.
	 * @type {HTMLDivElement}
	 */
	static chatbarButton;

	/**
	 * The internally relevant users' data. Populated by {@link computeUsersData}.
	 * @type {Object || Array}
	 */
	static users;

	/** @inheritDoc */
	get title() {
		return localize(this.options.window.title);
	}

	// Provides template with dynamic data:
	/** @override */
	async _prepareContext() {
		return {};
	}

	// Provides template parts with scoped dynamic data:
	/** @override */
	async _preparePartContext(partId, context) {
		switch ( partId ) {
			case "history":
				context.history = this.beautifyHistory();
				break;
			case "users":
				context.users = this.users;
				break;
		}
		return context;
	}

	_onRender(_context, _options) {
	}

	_onFirstRender(_context, _options) {
		/* Create div and move some of the partial elements into it. This is needed to maintain the ability to re-render
		 * specific partials on demand. Which would not be possible if a PART simply has multiple `templates` besides
		 * the main entry point template, as the "child" templates would not have targetable identifiers.
		 */
		const chatElements = document.createElement("div");
		chatElements.classList.add("chat-elements");
		chatElements.replaceChildren(...this.element.querySelectorAll(".chat-elements-part"));
		this.element.querySelector(".users").insertAdjacentElement("afterend", chatElements);

		// Attach actions to elements:
		// TODO: Adopt AppV2's "actions" instead.
		const html = $(this.element);

		// TODO: try to avoid using jQuery, e.g.:
		// this.element.querySelector("input[name=something]").addEventListener("click", /* ... */);

		html.find('button.send').click(async _event => {
			await this.sendMessage(html);
		});
		html.find('.message').on("keypress", event => this._onKeyPressEvent(event, html));

		this.scrollHistoryToBottom();
	}

	static async onSubmit(_event, _form, _formData) { }

	constructor(app) {
		super(app);
		this.history = [];
		this.settings = {
			playNotificationSound: getSetting("playNotificationSoundForNewWhisper")
		};
	}

	static async init() {
		registerSettings();
		registerKeybindings();
		registerHandlebarsHelpers();
		game.modules.get(MODULE_ID).instance = new LAME();
	}

	static onCollapseSidebar(_app, collapsed) {
		if (game.release.generation < 13) return;

		// Inspired by ChatLog#_toggleNotifications()
		const embedInput = (!collapsed && ui.chat.active);
		if (embedInput) LAME.moveChatbarButtonToSidebar()
		else LAME.moveChatbarButtonToNotificationArea();
	}

	static onChangeSidebarTab(app) {
		if (game.release.generation < 13) return;

		// TODO: Check if this can be done differently without triggering so many times, possibly not doing anything at all.
		//  Consider adding boolean member #chatbarVisible or similar.
		if (app.id === "chat") LAME.moveChatbarButtonToSidebar()
		else LAME.moveChatbarButtonToNotificationArea();
	}

	static moveChatbarButtonToSidebar(){
		const chatbarButton = game.modules.get(MODULE_ID).instance.chatbarButton;
		document.querySelector("#roll-privacy").insertAdjacentElement("afterend", chatbarButton);
	}

	static moveChatbarButtonToNotificationArea(){
		const chatbarButton = game.modules.get(MODULE_ID).instance.chatbarButton;
		document.getElementById("chat-notifications").append(chatbarButton);
	}

	static async onCreateChatMessage(msg, _options, _senderUserId) {
		const instance = game.modules.get(MODULE_ID).instance;
		if (instance.isPublicMessage(msg)
			|| !instance.isWhisperForMe(msg)
			|| instance.isMessageGameSystemGenerated(msg)
			|| instance.isMessageGameSystemSpecificRoll(msg)
			|| instance.isMessageModuleGenerated(msg)
		) return;

		await instance.handleIncomingPrivateMessage(msg);
	}

	beautifyHistory() {
		// TODO: I think this is called too often and the output should be cached if it isn't already.
		let beautified = [];

		for (let msg of this.history) {
			const timestamp = msg[0],
				date = new Date(timestamp),
				formattedTime = formatTimeHHMMSS(date),
				displayTime = (!isToday(date)) ? formatDateYYYYMMDD(date) + " " + formattedTime : formattedTime,
				toOrFrom = localize(msg[1] === 'in' ? "LAME.History.From" : "LAME.History.To"),
				author = msg[2],
				msgText = msg[3],
				alsoTo = (msg[4]) ? " (also to " + msg[4] + ")" : "";

			beautified.push(
				// [time] to/from [author name](also to [recipient name(s)]): [message]
				`[${displayTime}] ${toOrFrom} ${author}${alsoTo}: ${msgText}`
			);
		}
		return beautified;
	}

	async populateHistoryFromWorldMessages() {
		const worldMessages = game.collections.get("ChatMessage").contents;
		for (const msg of worldMessages) {
			if (this.isPublicMessage(msg)
				|| this.isMessageGameSystemGenerated(msg)
				|| this.isMessageGameSystemSpecificRoll(msg)
				|| this.isMessageModuleGenerated(msg)
			) continue;

			if (msg.isAuthor) {
				this.addOutgoingMessageToHistory(msg);
				continue;
			}

			if (this.isWhisperForMe(msg))
				this.#addIncomingMessageToHistory(msg);

			// Everything left are public messages and are not processed.
		}
	}

	async render(...args) {
		if (!this.rendered) {
			return await super.render(true, ...args);
		}

		await super.render(false);
	}

	/* This is needed as I can't figure out how to stop the window from re-rendering when it's already shown and
	 * one of the buttons is clicked to open the window. So I simply avoid additional logic and use `force: false`
	 * in render() if the window is already shown.
	 */
	async renderPart(partId) {
		if (!this.rendered) return false; // This could happen e.g. when a user (dis)connects and the window is closed.

		await super.render(false, { parts: [partId] }); // Note: This calls SUPER directly.
	}

	async renderHistoryPartial() {
		await this.renderPart("history");
		this.scrollHistoryToBottom();
	}

	// Without this, when pressing Ctrl+M while window is already shown, the window is incorrectly re-rendered fully.
	async show() {
		const instance = game.modules.get(MODULE_ID).instance;
		if (!instance.rendered) await instance.render();
	}

	scrollHistoryToBottom() {
		const history = document.getElementById(`${MODULE_ID}-history`);
		history.scrollTop = history.scrollHeight;
	}


	/** Return object with relevant user data.
	 *  @type {Object}
	 *  @example
	 *     {
	 *         "GIH5NgrlsQUbympt": {
	 *             "name": "Lucas",
	 *             "id": "GIH5NgrlsQUbympt",
	 *             "avatar": "images/portrait-lucas.webp",
	 *             "active": true,
	 *             "exclude": false
	 *         }
	 *     }
	 */
	computeUsersData() {
		function toExclude(user, showInactiveUsers, usersToExclude) {
			// Exclude inactive user unless inactive users should be shown:
			if (!user.active && !showInactiveUsers) return true;

			// Foundry v12:
			if (Array.isArray(usersToExclude)
				&& usersToExclude.length > 0
				&& usersToExclude.includes(user.id)
			) return true;

			// Foundry v13:
			if (usersToExclude instanceof Set
				&& usersToExclude.size > 0
				&& usersToExclude.has(user.id)
			) return true;

			return false;
		}

		const showInactiveUsers = getSetting('showInactiveUsers'),
			usersToExclude = getSetting("usersToExclude");

		let usersData = {};
		for (let user of game.users) {
			if (user.isSelf || user.isBanned) continue;

			usersData[user.id] = {
				name: user.name,
				id: user.id,
				avatar: user.avatar,
				active: user.active, // user currently connected
				exclude: toExclude(user, showInactiveUsers, usersToExclude)
			};
		}
		this.users = usersData;
	}

	static async computeUsersDataAndRenderPartial() {
		const instance = game.modules.get(MODULE_ID).instance;
		instance.computeUsersData();
		await instance.renderPart('users');
	}

	sendWhisperTo(userIds, msg) {
		const chatData = {
			user: game.user.id,
			content: msg,
			whisper: userIds
		};
		ChatMessage.create(chatData);
	}

	async _onKeyPressEvent(event, html) {
		if ((event.code === "Enter") && event.ctrlKey) {
			await this.sendMessage(html);
		}
	}

	async sendMessage(html) {
		// Get message text:
		const messageField = html.find('.message'),
			messageText = messageField.val();
		if (messageText.length === 0) {
			ui.notifications.error(localize("LAME.Notification.NoMessageToSend"));
			return;
		}

		// Get selected user(s):
		const checkedUserElements = html.find('input[id^="lame-messenger-user-"]:checked');
		let selectedUserIds = [];
		checkedUserElements.each(function () {
			selectedUserIds.push(this.id.replace('lame-messenger-user-', ''));
		});
		if (selectedUserIds.length === 0) {
			ui.notifications.error(localize("LAME.Notification.NoRecipientSelected"));
			return;
		}

		// Send whisper(s):
		this.sendWhisperTo(selectedUserIds, messageText);
		const selectedUserNames = this.#mapUsersIdsToNames(selectedUserIds);
		this.addOutgoingTextToHistory(selectedUserNames, messageText);
		await this.renderHistoryPartial();

		// Clear message input field for next text:
		messageField.val('');
	}

	async handleIncomingPrivateMessage(msg) {
		if (getSetting("showNotificationForNewWhisper")) {
			ui.notifications.info(
				`${localize("LAME.IncomingWhisperFrom")} ${msg.author.name}`,
				{ permanent: getSetting("permanentNotificationForNewWhisper") },
			);
		}

		this.#addIncomingMessageToHistory(msg);
		await this.playNotificationSound();

		if (!this.rendered) return this.render();

		await this.renderHistoryPartial();
	}

	async playNotificationSound() {
		if (!this.settings.playNotificationSound) return;

		/* Unless played via `autoplay`, the sound is not played on `interface` channel/context but on `music`.
		 * This seems to be a bug in Foundry itself.
		 * Therefore, it can not just be created _once_ during initialisation and then #play-ed.
		 * According to browser network inspection, the file is at least not requested multiple times.
		 */
		await game.audio.create({
			src: "modules/lame-messenger/sounds/pst-pst.ogg",
			context: game.audio.interface,
			singleton: false,
			preload: true,
			autoplay: true
		});
	}

	#addIncomingMessageToHistory(msg) {
		const alsoToIds = msg.whisper.filter(userId => userId !== game.user.id),
			alsoToNames = this.#mapUsersIdsToNames(alsoToIds),
			conjunctedAlsoToNames = i18nLongConjunct(alsoToNames)
		this.#addIncomingTextToHistory(msg.author.name, msg.content, msg.timestamp, conjunctedAlsoToNames);
	}

	#addIncomingTextToHistory(authorName, text, timestamp, alsoTo = null) {
		this.history.push([timestamp, 'in', authorName, text, alsoTo]);
	}

	#mapUsersIdsToNames(ids) {
		function getUserNameFromId(id, users) {
			// If user does not exist, it was either deleted in the world, or is excluded via settings.
			if (!users[id]) return "unknown";

			return users[id].name;
		}

		return ids.map(id => getUserNameFromId(id, this.users));
	}

	addOutgoingMessageToHistory(msg) {
		const recipientNames = this.#mapUsersIdsToNames(msg.whisper);
		this.addOutgoingTextToHistory(recipientNames, msg.content, msg.timestamp);
	}

	addOutgoingTextToHistory(recipientNames, text, timestamp = null) {
		if (!timestamp) timestamp = Date.now();
		const conjunctedRecipientNames = i18nLongConjunct(recipientNames);
		// As Foundry can only send messages to a single recipient, the conjunction is only kept for in-memory history.
		this.history.push([timestamp, 'out', conjunctedRecipientNames, text]);
	}

	isPublicMessage(msg) {
		return !msg.whisper.length;
	}

	isWhisperForMe(msg) {
		if (msg.isAuthor      // outgoing whispers,
			|| !msg.visible   // whispers where the current user is neither author nor recipient,
			|| msg.isRoll     // and private dice rolls.
		) return false;

		return true;
	}

	isMessageGameSystemGenerated(msg) {
		const systemGens = [
			'<h3 class="nue">Getting Started</h3>',       // core: welcome to new world
			'<h3 class="nue">Inviting Your Players</h3>', // core
			'<span class=\"award-entry\">',               // dnd5e: "[character] has been awarded [...]"
			'<p class="requestmessage">'                  // wfrp4e: skill tests
		];

		return systemGens.some((item) => msg.content.includes(item));
	}

	isMessageGameSystemSpecificRoll(msg) {
		if (msg._stats?.systemId === 'wfrp4e' && ( // Warhammer Fantasy 4e (system doesn't implement #isRoll)
			msg.type === 'test' // skill or attribute tests
			|| msg.type === 'handler' // opposed test handler messages
			|| msg.type === 'opposed' // opposed test results
		)) return true;

		return false;
	}

	isMessageModuleGenerated(msg) {
		const moduleWelcomes = [
			'<div class="dice-so-nice">',  // Dice So Nice
			'<p>Welcome to Plutonium!</p>' // Plutonium
		];

		return moduleWelcomes.some((item) => msg.content.includes(item));
	}
}
