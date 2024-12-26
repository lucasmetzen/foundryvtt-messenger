export function registerHandlebarsHelpers() {
    Handlebars.registerHelper("isAtLeastOneUserToBeShown", function () {
        return window.LAME.users.length > 0;
    });

    // TODO: Try to improve this process: (https://github.com/lucasmetzen/foundryvtt-messenger/issues/25)
    Handlebars.registerHelper("beautifiedHistory", function () {
        return window.LAME.beautifyHistory();
    });

    Handlebars.registerHelper("userColor", function (userId) {
        return `var(--user-color-${userId})`;
    });
}
