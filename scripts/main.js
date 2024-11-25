// export const NAME = "name-of-module";
const NAME = "lucas-messenger",
	TITLE = "Lucas's Almost Magnificent Messenger", // or Lucas's Almost Awesome Messenger; or Lucas's Awesome Messenger Extension
	TITLE_ABBREVIATION = "LAMM",
	PATH = `modules/${NAME}`,
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
		newLAMM.history = []
		//newLAMM.window = new LAMMwindow();
		window.LAMM = newLAMM;
        //let template = Handlebars.compile('{{> modules/token-action-hud/templates/tagdialog.hbs}}');
		log('set up');
	}

	static ready() {
	    /* operations = {
	        isMaster: () => PseudoClock.isMaster,
	        isRunning: PseudoClock.isRunning,
	        doAt: ElapsedTime.doAt,
	        doIn: ElapsedTime.doIn,
	        doEvery: ElapsedTime.doEvery,
	        doAtEvery: ElapsedTime.doAtEvery,
	        reminderAt: ElapsedTime.reminderAt,
	        reminderIn: ElapsedTime.reminderIn,
	        reminderEvery: ElapsedTime.reminderEvery,
	        reminderAtEvery: ElapsedTime.reminderAtEvery,
	        notifyAt: ElapsedTime.notifyAt,
	        notifyIn: ElapsedTime.notifyIn,
	        notifyEvery: ElapsedTime.notifyEvery,
	        notifyAtEvery: ElapsedTime.notifyAtEvery,
	        clearTimeout: ElapsedTime.gclearTimeout,
	        getTimeString: ElapsedTime.currentTimeString,
	        getTime: ElapsedTime.currentTimeString,
	        queue: ElapsedTime.showQueue,
	        chatQueue: ElapsedTime.chatQueue,
	        ElapsedTime: ElapsedTime,
	        DTM: DTMod,
	        DTC: DTCalc,
	        DT: DateTime,
	        DMf: DTMod.create,
	        DTf: DateTime.create,
	        DTNow: DateTime.now,
	        calendars: calendars,
	        _notifyEvent: PseudoClock.notifyEvent,
	        startRunning: PseudoClock.startRealTime,
	        stopRunning: PseudoClock.stopRealTime,
	        mutiny: PseudoClock.mutiny,
	        advanceClock: ElapsedTime.advanceClock,
	        advanceTime: ElapsedTime.advanceTime,
	        setClock: PseudoClock.setClock,
	        setTime: ElapsedTime.setTime,
	        setAbsolute: ElapsedTime.setAbsolute,
	        setDateTime: ElapsedTime.setDateTime,
	        flushQueue: ElapsedTime._flushQueue,
	        reset: ElapsedTime._initialize,
	        resetCombats: ElapsedTime.resetCombats,
	        status: ElapsedTime.status,
	        pc: PseudoClock,
	        showClock: SimpleCalendarDisplay.showClock,
	        CountDown: CountDown,
	        RealTimeCountDown: RealTimeCountDown,
	        _save: ElapsedTime._save,
	        _load: ElapsedTime._load,
	    };
	    //@ts-ignore
	    game.Gametime = operations;
	    //@ts-ignore
	    window.Gametime = operations;*/
		window.LAMM.users = window.LAMM.computeUsersData(); // DEBUG: das kann so nicht sinn der sache sein...
		log('ready')
	}

	static get defaultOptions() {
		const options = super.defaultOptions;
	    /*return mergeObject(super.defaultOptions, {
	      width: 560,
	      height: 420,
	      classes: ["dnd5e", "sheet", "item"],
	      resizable: true,
	      scrollY: [".tab.details"],
	      tabs: [{navSelector: ".tabs", contentSelector: ".sheet-body", initial: "description"}]
	    });*/

		options.title = TITLE;
		options.classes = options.classes.concat('messenger');
		options.template = TEMPLATES.whispers;
		options.popout = true;
		options.resizable = false;
		options.minimizable = true;
		options.closeOnSubmit = false;
		options.submitOnClose = false;
		options.submitOnUnfocus = false;
		// options.buttons = { // isn't doing anything
		return options;
	}

	beautifyHistory() {
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
	    // render(force, context={}) {
		// log('rendered', this.rendered);
		if (!this.rendered) return super.render(true, ...args);
	}

	isCurrentUser(user) {
		return user.data._id == game.user._id;
	}

	computeUsersData() {
		let usersData = [];
		for (let user of game.users.entities) {
			if (this.isCurrentUser(user) || (user.data.name == "DM's Helper") || (user.data.role == 0)) continue;
			// user roles: 0 = none, 1 = player, 2 = trusted, 3 = assistant, 4 = gamemaster

			let data = {
				name: user.data.name,
				id: user.data._id,
				avatar: user.data.avatar,
				color: user.data.color,
				active: user.data.active,
			};
			usersData.push(data);
		}
		return usersData;
	}

	getUserNameFromId(id) {
		return window.LAMM.users.find(user => user.id === id).name;
	}

	getUserIdFromName(name) {
		return window.LAMM.users.find(user => user.name === name).id;
	}

	sendWhisperTo(userNames, msg) {
		let chatData = {
			user: game.user._id,
			content: msg,
			sound: "modules/lucas-messenger/sounds/pst-pst.mp3"
		};

		for (let user of userNames) {
			chatData.whisper = ChatMessage.getWhisperRecipients(user);
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
		if (!this.rendered) return this.render();

		await this.renderHistoryPartial();
	}

	/*convertTimestampToTime(timestamp) {
		let date = new Date(data.data.timestamp);
		return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
	}*/

	currentTime() {
		function padLeadingZero(num) {
			return ('00' + num).slice(-2);
		}
		let date = new Date();
		return padLeadingZero(date.getHours()) + ":" + padLeadingZero(date.getMinutes()) + ":" + padLeadingZero(date.getSeconds());
	}

	addIncomingMessageToHistory(data) {
		// const time = this.convertTimestampToTime(data.data.timestamp);
		const time = this.currentTime();
		this.history.push([time, 'in', data.data.user, data.data.content]);
        //if (LMRTFY.requestor === undefined)
        //    LMRTFY.requestor = new LMRTFYRequestor();
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

/*
Hooks.on("getSceneControlButtons", (controls) => {
	log('controls', controls)
	controls.push({
		icon: "fas fa-comment-dots",
		name: "lamm",
		title: TITLE,
		visible: true,
		tools: [
			{
				name: "lamm-nested-01",
				title: "LAMM nested",
				icon: "fas fa-hat-wizard",
				onClick: () => {
					log('control button clicked')
					window.LAMM.render();
				},
				button: true,
				active: true
			}
		],
		layer: 'lamm-layer',  // THIS FAILS because the layer is not defined.
		activeTool: 'lamm-nested-01'
	})
})
*/

/*
Hooks.on("getSceneControlButtons", (controls) => {
	// https://foundryvtt.com/api/functions/hookEvents.getSceneControlButtons.html
	// https://foundryvtt.com/api/interfaces/client.SceneControl.html
	// It does not seem to be possible to add a non-menu button to the controls this way.
	controls[0].tools.push({
		icon: "fas fa-comment-dots",
		name: "lamm",
		title: TITLE,
		visible: true,
		button: true,
		onClick: () => {
			log('control button clicked')
			window.LAMM.render();
		}
	})
})
*/

Hooks.on("createChatMessage", async (data, options, senderUserId) => {
	// const showNotif = game.settings.get(moduleName, showWhisperNotificationsKey);
	const isToMe = (data?.data?.whisper ?? []).includes(game.userId),
		isFromMe = senderUserId === game.userId,
		LAMM = window.LAMM;
	/*if (override && isToMe) {
	data.data.sound = override;
	}*/

	if (!isToMe || isFromMe) return;
	if (data.data.content.indexOf('<div>') > -1) return; // ignore privat messages (to GM) that are roll results or Midi-QOL cards

	// TODO: play "modules/lucas-messenger/sounds/pst-pst.mp3" here instead of on sending the message
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


















/*
    static getSceneControlButtons(buttons) {
        let tokenButton = buttons.find(b => b.name == "token")

        if (tokenButton) {
            tokenButton.tools.push({
                name: "request-roll",
                title: game.i18n.localize('LMRTFY.ControlTitle'),
                icon: "fas fa-dice-d20",
                visible: game.user.isGM,
                onClick: () => LMRTFY.requestRoll(),
                button: true
            });
        }
    }
}

Hooks.on('getSceneControlButtons', LMRTFY.getSceneControlButtons);
*/
