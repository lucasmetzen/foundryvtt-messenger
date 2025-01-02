export function registerHandlebarsHelpers() {
    Handlebars.registerHelper("isAtLeastOneUserToBeShown", function () {
        return Object.keys(window.LAME.users).length > 0;
    });

    Handlebars.registerHelper("userColor", function (userId) {
        return `var(--user-color-${userId})`;
    });
}
