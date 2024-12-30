# ![logo](https://github.com/lucasmetzen/foundryvtt-messenger/blob/main/docs/logo.svg?raw=true) Lucas's Awesome Messenger Extension, or short: LAME Messenger

LAME Messenger for Foundry VTT provides a simple messenger interface to easily whisper messages.

![Foundry VTT version compatibility: v12](https://img.shields.io/badge/Foundry_VTT-v12-informational)
[![GitHub issues](https://img.shields.io/github/issues/lucasmetzen/foundryvtt-messenger/bug)](https://github.com/lucasmetzen/foundryvtt-messenger/issues/)
![Latest release download count](https://img.shields.io/github/downloads/lucasmetzen/foundryvtt-messenger/latest/module.zip?label=latest+release+download+count)
![Forge installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Flame-messenger&colorB=4aa94a)

![LAME Messenger interface introduction](https://github.com/lucasmetzen/foundryvtt-messenger/blob/main/docs/README-introduction.webp?raw=true)

- Do you keep missing whispers other players send you?
- Would you like to see a chat history of sent and received private messages without having to scroll through all chat cards in the sidebar?
- Ever wanted to send a single message to multiple players at the same time?
- Are you tired of having to type `/whisper` each time you want to send a direct message to a player?
- Can you never remember a player's username when you want to text them privately?

If you answered at least one of those questions with "Yes", then LAME Messenger is the right module for you!

---

## ✨ Features

- Dedicated window for sending and receiving whispers with chat history
- Send a message to multiple recipients at the same time:  
  ![message sent to two users](https://github.com/lucasmetzen/foundryvtt-messenger/blob/main/docs/README-message-sent-to-two-users.webp?raw=true)
- Visual and auditory notification for incoming whisper (optional)
- No need to type `/whisper` command and recipient's username in Foundry VTT's chat box
- Shows a user's avatar or associated actor's image in addition to their name if set in world's user configuration:  
  ![message sent to two users](https://github.com/lucasmetzen/foundryvtt-messenger/blob/main/docs/README-user-avatar.webp?raw=true)
- Messenger window opens upon receiving a whisper (optional) 

Note: The module is not a replacement for Foundry VTT's built-in whisper messaging but is an additional graphical interface.


## ⚡️ Installation

This module can be installed automatically from the Foundry Virtual Tabletop module browser, or by using the following module manifest URL:  
  https://github.com/lucasmetzen/foundryvtt-messenger/releases/latest/download/module.json


## 🎨 Configurable options

- Show notification message for incoming whisper
- Notification message is displayed until dismissed
- Show currently disconnected users in user selection:  
  ![disconnected users shown](https://github.com/lucasmetzen/foundryvtt-messenger/blob/main/docs/README-disconnected-users-shown.webp?raw=true)
- Show button in chat sidebar (next to the roll type selector) to open LAME messenger window (shown by default):  
  ![button in chat sidebar](https://github.com/lucasmetzen/foundryvtt-messenger/blob/main/docs/README-button-in-chat-sidebar.webp?raw=true)
- Show button in scene controls toolbar (left side of screen) to open LAME messenger window:  
  ![button in scene controls toolbar](https://github.com/lucasmetzen/foundryvtt-messenger/blob/main/docs/README-button-in-scene-controls-toolbar.webp?raw=true)
- Customisable keyboard shortcut for opening the window (via "Configure Controls" dialogue)

## 🚧 Current limitations

- LAME Messenger's chat history only shows messages you have sent and received until you either reload the browser window, or log out of Foundry VTT. The module currently does not store messages separately from Foundry VTT (as seen in the sidebar's chat tab), and doesn't compile a history from the whispers existing in the world's database. A persistent solution is planned for future releases.
- Messages not sent privately as a whisper (AKA "public" or dice rolls) are not handled by LAME Messenger. Public chat might be included in a future release.
- When a player connects or disconnects while you have players selected to send to, the selection is cleared as the players list is re-rendered. As a tabbed window solution is planned for the near future which will change most of the UI anyway, this won't be fixed at the moment. Apologies for this initial inconvenience.
- Game systems send some status messages privately (e.g. when items or experience are awarded). While all private messages containing dice rolls (e.g. self or GM rolls) are already filtered, there surely will be some which LAME Messenger is going to treat as actual whispers. If you come across any, please report them via the [GitHub issue tracker](https://github.com/lucasmetzen/foundryvtt-messenger/issues).

## 💡 Planned features

- Tabbed chat for each user
- Configurable notification sound
- Configurable keyboard shortcuts (insert line break while typing message, and send message)
- Option to show the character's portrait image instead of the user's avatar if the user has an associated actor
- Possibly allow user defined RegularExpressions to filter certain received whispers. 


## 🩹 Troubleshooting

_"I don't hear the notification sound when I receive a whisper."_  
The sound is played in the `interface` context, so please make sure to set the volume for `Interface` to audible levels.   
 
_"The messenger's history is empty after I reloaded the browser windows, or after logging out and in again."_  
Solution: LAME Messenger currently does not store messages separately from Foundry VTT (as seen in the sidebar's chat tab), and doesn't compile a history from the whispers existing in the world's database. A persistent solution is planned for future releases.
 
_"I can't send a message I've typed in the messenger."_  
You might not have selected at least one user to send to.
 
_"No users are shown to select from."_  
You can only send messages to users that are currently connected. Therefore, offline users are by default not listed (and if you set the option to show them, they aren't selectable unless they connect).

_"I can't see messages other users sent to users other than myself."_  
That's by design, as LAME Messenger handles whispers the same way Foundry VTT does.

_"I have found a bug."_  
Please first ensure the problem is reproducible, best with all other modules deactivated. If it still happens, feel free to check the [GitHub issue tracker](https://github.com/lucasmetzen/foundryvtt-messenger/issues) if it is already known. If it isn't, please open a new issue.


## 🎉 Credits & Thanks

- Player avatars seen in the screenshots in this README are token artwork by "Stryxin" and [Forgotten Adventures](https://www.forgotten-adventures.net) which are included in Foundry VTT's _Dungeons & Dragons Fifth Edition_ system. The depiction is for demonstrational purposes only and this module does not include any of this artwork.
- Thanks to Zaphyr for patiently waiting for this module to become publicly available since I started its development back in Foundry VTT version 0.5.1 in March 2020.
- Thanks to Darksmaug, LittleKing205, Aphasmayra, and dawnofdope for additional testing and feedback.
- Kudos to everyone who read the full README, and thinks the module's name might be just a bit tongue-in-cheek.
