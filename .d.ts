declare global {
    // Not a real extension of course but simplest way to expose Foundry's API to the IDE.
    /**
     * A simple event framework used throughout Foundry Virtual Tabletop.
     * When key actions or events occur, a "hook" is defined where user-defined callback functions can execute.
     * This class manages the registration and execution of hooked callback functions.
     */
    class Hooks extends foundry.helpers.Hooks {}
    const fromUuid = foundry.utils.fromUuid;
    const fromUuidSync = foundry.utils.fromUuidSync;
}
