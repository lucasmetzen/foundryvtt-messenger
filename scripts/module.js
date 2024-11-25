const MODULE_ID = "lucas-messenger",
	TITLE = "Lucas's Almost Magnificent Messenger", // or Lucas's Almost Awesome Messenger; or Lucas's Awesome Messenger Extension
	TITLE_ABBREVIATION = "LAMM",
	PATH = `modules/${MODULE_ID}`,
	TEMPLATE_PATH = `${PATH}/templates`,
	TEMPLATES = {
		history: `${TEMPLATE_PATH}/history.hbs`,
		whispers: `${TEMPLATE_PATH}/whispers.html`
	},
    CONSOLE_MESSAGE_PRESET = [`%c${TITLE_ABBREVIATION}%c |`, 'background: #8000ff; color: #fff', 'color: #fff']; // see chat-images\scripts\utils.js


function log(...args) {
	console.log(...CONSOLE_MESSAGE_PRESET, ...args);
}


class LAMM extends FormApplication { /* TODO: A subclass of the FormApplication must implement the _updateObject method. */

	constructor(app) {
		super(app);
		// this.users = this.computeUsersData(); // DEBUG: deactivated for .setup() test
		this.history = [];
		this.pstSound = new Sound("modules/lucas-messenger/sounds/pst-pst.ogg");
		// this.window = new LAMMwindow();
	}

	static async init() {
		let templates = [];
		for (const key in TEMPLATES) {
			templates.push(TEMPLATES[key]);
		}
		loadTemplates(templates);
		log('initialised');
	}

	static setup() {
		const newLAMM = new LAMM();
		newLAMM.history = [];
		//newLAMM.window = new LAMMwindow();
		window.LAMM = newLAMM;
		log('set up');
	}

	static ready() {
		window.LAMM.users = window.LAMM.computeUsersData(); // TODO: Look into this again as this doesn't seem to be the intended way...
		window.LAMM.pstSound.load();
		log('ready')
	}

	static get defaultOptions() {
		const options = super.defaultOptions;
		options.title = TITLE;
		options.classes = options.classes.concat('messenger');
		options.template = TEMPLATES.whispers;
		options.popout = true;
		options.resizable = false;
		options.minimizable = true;
		options.closeOnSubmit = false;
		options.submitOnClose = false;
		options.submitOnUnfocus = false;
		return options;
	}

	beautifyHistory() {
		// TODO: I think this is called too often and the output should be cached if it isn't already.
		let beautified = [];
		for (let msg of this.history) {
			beautified.push(
				msg[0] + // (date &) time
				(msg[1] === 'in' ? ' from ' : ' to ') + // in or out
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
		const data = { history: this.beautifyHistory() },
			history = await renderTemplate(TEMPLATES.history, data);
		$('#history').val(history);
	}

	// Provides template with dynamic data:
	getData() {
		return {
			users: this.users,
			history: this.beautifyHistory()
		};
	}

	render(...args) {
		if (!this.rendered) return super.render(true, ...args);
	}

	computeUsersData() {
		let usersData = [];
		for (let user of game.users) {
			if (user.isSelf || (user.name == "DM's Helper") || user.isBanned) continue;

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
		log('getUserNameFromId > users', window.LAMM.users)*/
		return window.LAMM.users.find(user => user.id === id).name;
	}

	getUserIdFromName(name) {
		return window.LAMM.users.find(user => user.name === name).id;
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

	activateListeners(html) {
		super.activateListeners(html);

		// Submit/Send button:
		html.find('input[type="submit"]').click(event => {
			this.sendMessage(html);
		});

		html.find('#message').on("keypress", event => this._onKeyPressEvent(event, html));
	}

	_onKeyPressEvent(event, html) {
		if ((event.keyCode === 10) && event.ctrlKey) { // for `#on("keyup")` it's 13 when combined with Ctrl
			this.sendMessage(html);
		}
	}

	sendMessage(html) {
		// Get selected users:
		const checkedUserElements = html.find('input[id^="user-"]:checked');
		let selectedUserNames = [];
		checkedUserElements.each(function() {
			selectedUserNames.push(this.id.replace('user-', ''));
		});
		if (selectedUserNames.length == 0) {
			ui.notifications.error("No recipient selected.")
			return;
		}
		
		// Send whisper(s):
		const messageField = html.find('#message');
		let message = messageField.val();
		if (message.length == 0) {
			ui.notifications.error("Nothing to send.")
			return;
		}
		this.sendWhisperTo(selectedUserNames, message);
		this.addOutgoingMessageToHistory(selectedUserNames, message);
		this.renderHistoryPartial();

		// Uncheck users and clear text area:
		// checkedUserElements.prop('checked', false);
		messageField.val('');
	}

	async handleIncomingPrivateMessage(data) {
		this.addIncomingMessageToHistory(data);
		await window.LAMM.pstSound.play();
		if (!this.rendered) return this.render();

		await this.renderHistoryPartial();
	}

	currentTime() {
		function padLeadingZero(num) {
			return ('00' + num).slice(-2);
		}
		let date = new Date();
		return padLeadingZero(date.getHours()) + ":" + padLeadingZero(date.getMinutes()) + ":" + padLeadingZero(date.getSeconds());
	}

	addIncomingMessageToHistory(data) {
		const time = this.currentTime();
		// TODO: data.user.id should be replaced by data.author.name and the whole process simplified
		// TODO: data.user is also now deprecated since v12 in favor of data.author.
		this.history.push([time, 'in', data.user.id, data.content]);
	}

	addOutgoingMessageToHistory(recipients, msg) {
		for (let recipient of recipients) {
			const time = this.currentTime();
			this.history.push([time, 'out', this.getUserIdFromName(recipient), msg]);
		}
	}

    async _updateObject() { // `event` uninteresting, `formData` empty 
    	// log('_updateObject');
    	// TODO: check if msg has been sent or if no user was selected. if the latter, this would clear the message unintentionally
    	this.render();
	}
}

/* class LAMMwindow {
	constructor() {
		console.log('LAMMwindow: constructed');
	}

	hi() {
		console.log('LAMMwindow: hi');
	}
} */


// Add icon to left tool bar:
Hooks.on('renderSceneControls', (controls, html) => {
	const messengerBtn = $(
		`<li class="scene-control">
			<i class="fas fa-comment-dots"></i>
		</li>`
	);
	messengerBtn[0].addEventListener('click', evt => {
		// evt.stopPropagation();
		// return new LAMM().render(true);
		window.LAMM.render();
	});

	html.find('.control-tools').find('.scene-control').last().after(messengerBtn);
});

Hooks.on("createChatMessage", async (data, options, senderUserId) => {
	// const showNotif = game.settings.get(moduleName, showWhisperNotificationsKey);
	const isToMe = (data?.whisper ?? []).includes(game.userId),
		isFromMe = senderUserId === game.userId,
		LAMM = window.LAMM;
	/*if (override && isToMe) {
	data.data.sound = override;
	}*/

	if (!isToMe || isFromMe) return;
	// TODO: re-add the following:
	// if (data.data.content.indexOf('<div>') > -1) return; // ignore privat messages (to GM) that are roll results or Midi-QOL cards

	/* ui.notifications.info(
		`Whisper from ${data.user.data.name}`,
		{ permanent: true },
	); */

	// log('incoming whisper', data, options, senderUserId)
	LAMM.handleIncomingPrivateMessage(data);
});

Hooks.once('init', LAMM.init); // this feels VERY early in Foundry's initialisation...
Hooks.once('setup', LAMM.setup);
Hooks.once('ready', LAMM.ready);

/* Hooks.on('renderPlayerList', () => {
	window.LAMM.users = window.LAMM.computeUsersData(); // update player list when user (dis)connects
} */
