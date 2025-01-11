export function registerHandlebarsHelpers() {
    Handlebars.registerHelper("isAtLeastOneUserToBeShown", function () {
        return Object.values(this.users).some(user => !user.exclude);
    });

    Handlebars.registerHelper("userColor", function (userId) {
        return `var(--user-color-${userId})`;
    });
}
