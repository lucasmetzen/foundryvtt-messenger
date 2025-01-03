const {ApplicationV2, HandlebarsApplicationMixin} = foundry.applications.api;

import {localize, MODULE_ID, MODULE_ICON_CLASSES, TEMPLATE_PARTS_PATH} from "./config.mjs";
import {getSetting, registerSettings} from "./settings.mjs";
import {registerKeybindings} from "./keybindings.mjs";
import {registerHandlebarsHelpers} from "./helpers/handlebars-helpers.mjs";
import {formatDateYYYYMMDD, formatTimeHHMMSS, isToday} from "./helpers/date-time-helpers.mjs";
import {i18nLongConjunct} from "./helpers/i18n.mjs";
import {foundryCoreVersion} from "./helpers/version-helpers.mjs";

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

	/** @inheritDoc */
	get title() {
		return localize(this.options.window.title);
	}

	// Provides template with dynamic data:
	/** @override */
	async _prepareContext() {
		return {
			users: this.users
		};
	}

	// Provides template parts with scoped dynamic data:
	/** @override */
	async _preparePartContext(partId, context) {
		switch ( partId ) {
			case "history":
				context.history = this.beautifyHistory();
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
		window.LAME = new LAME();
	}

	static async ready() {
		window.LAME.computeUsersData(); // TODO: Look into this again as this doesn't seem to be the intended way...
		await window.LAME.populateHistoryFromWorldMessages();
		// TODO: Check if there is a better way for the initial moving of the button to the notification area,
		//  as we just _assume_ the sidebar is collapsed.
		// Initially display button in notification area as sidebar is usually collapsed:
		if (!ui.sidebar.expanded) LAME.onCollapseSidebar(undefined, true);
	}

	static onCollapseSidebar(_app, collapsed) {
		if (foundryCoreVersion().major < 13) return;

		// Inspired by ChatLog#_toggleNotifications()
		const embedInput = (!collapsed && ui.chat.active);
		if (embedInput) {
			document.querySelector("#roll-privacy").insertAdjacentElement("afterend", LAME.chatbarButton);
		} else document.getElementById("chat-notifications").append(LAME.chatbarButton);
	}

	static onChangeSidebarTab(app) {
		if (foundryCoreVersion().major < 13) return;

		// TODO: Check if this can be done differently without triggering so many times, possibly not doing anything at all.
		//  Consider adding boolean member #chatbarVisible or similar.
		if (app.id === "chat") {
			document.querySelector("#roll-privacy").insertAdjacentElement("afterend", LAME.chatbarButton);
		} else document.getElementById("chat-notifications").append(LAME.chatbarButton);
	}

	static async hookCreateChatMessage(msg, _options, _senderUserId) {
		if (window.LAME.isPublicMessage(msg)
			|| !window.LAME.isWhisperForMe(msg)
			|| window.LAME.isMessageGameSystemGenerated(msg)
		) return;

		await window.LAME.handleIncomingPrivateMessage(msg);
	}

	beautifyHistory() {
		// TODO: I think this is called too often and the output should be cached if it isn't already.
		let beautified = [];

		for (let msg of this.history) {
			const timestamp = msg[0],
				date = new Date(timestamp),
				formattedTime = formatTimeHHMMSS(date),
				displayTime = (!isToday(date)) ? formatDateYYYYMMDD(date) + " " + formattedTime : formattedTime,
				toOrFrom = localize(msg[1] === 'in' ? "LAME.History.From" : "LAME.History.To");

			beautified.push(
				`[${displayTime}] ${toOrFrom} ${msg[2]}: ${msg[3]}` // [time] to/from [player name]: [message]
			);
		}
		return beautified;
	}

	async populateHistoryFromWorldMessages() {
		const worldMessages = game.collections.get("ChatMessage").contents;
		for (const msg of worldMessages) {
			if (this.isPublicMessage(msg) || this.isMessageGameSystemGenerated(msg)) continue;

			if (msg.isAuthor) {
				this.addOutgoingMessageToHistory(msg);
				continue;
			}

			if (this.isWhisperForMe(msg))
				this.addIncomingMessageToHistory(msg);

			// Everything left are public messages.
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

	scrollHistoryToBottom() {
		const history = document.getElementById(`${MODULE_ID}-history`);
		history.scrollTop = history.scrollHeight;
	}

	computeUsersData() {
		const showInactiveUsers = getSetting('showInactiveUsers'),
			usersToExclude = getSetting("usersToExclude"); // This returns a Set object.

		let usersData = {};
		for (let user of game.users) {
			// TODO: instead of skipping self, banned, excluded, and non-active users here,
			//  consider including all and simply add attribute(s) like "ignore".
			if (user.isSelf || user.isBanned || (usersToExclude.size > 0 && usersToExclude.includes(user.id))) continue;

			// Skip inactive user unless inactive users should be shown:
			if (!user.active && !showInactiveUsers) continue;

			usersData[user.id] = {
				name: user.name,
				id: user.id,
				avatar: user.avatar,
				active: user.active // user currently connected
			};
		}
		window.LAME.users = usersData;
	}

	static async computeUsersDataAndRenderPartial() {
		window.LAME.computeUsersData();
		await window.LAME.renderPart('users');
	}

	sendWhisperTo(userNames, msg) {
		for (let username of userNames) {
			// chatData needs to be defined for each message as the .whisper assignment is not overwritten on subsequent loops,
			//  resulting in multiple messages with unique document IDs but to the same recipient.
			let chatData = {
				user: game.user.id,
				content: msg
			};
			chatData.whisper = ChatMessage.getWhisperRecipients(username);
			ChatMessage.create(chatData);
		}
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
		const checkedUserElements = html.find('input[id^="user-"]:checked');
		let selectedUserNames = [];
		checkedUserElements.each(function () {
			selectedUserNames.push(this.id.replace('user-', ''));
		});
		if (selectedUserNames.length === 0) {
			ui.notifications.error(localize("LAME.Notification.NoRecipientSelected"));
			return;
		}

		// Send whisper(s):
		this.sendWhisperTo(selectedUserNames, messageText);
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

		this.addIncomingMessageToHistory(msg);
		await window.LAME.playNotificationSound();

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

	addIncomingMessageToHistory(msg) {
		this.addIncomingTextToHistory(msg.author.name, msg.content, msg.timestamp)
	}

	addIncomingTextToHistory(authorName, text, timestamp) {
		this.history.push([timestamp, 'in', authorName, text]);
	}

	addOutgoingMessageToHistory(msg) {
		function getUserNameFromId(id) {
			// If user does not exist, it was either deleted in the world, or is excluded via settings.
			if (!window.LAME.users[id]) return "unknown";

			return window.LAME.users[id].name;
		}

		const recipientNames = msg.whisper.map(id => getUserNameFromId(id));
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
			'<span class=\"award-entry\">'                // dnd5e: "[character] has been awarded [...]"
		]
		return systemGens.some((item) => msg.content.includes(item));
	}
}
