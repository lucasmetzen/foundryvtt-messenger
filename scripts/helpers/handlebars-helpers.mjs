export function registerHandlebarsHelpers() {
    Handlebars.registerHelper("isAtLeastOneUserToBeShown", function () {
        return window.LAME.users.length > 0;
    });
}

import { TEMPLATE_PATH } from "../config.mjs";
import { log } from "./log.mjs";

/*function templateFilePath(templateId) {
    // return new Handlebars.SafeString(TEMPLATE_PATH[templateId]);
    return TEMPLATE_PATH[templateId];
}*/

/*
Handlebars.registerHelper("templateFilePath", function(templateId) {
    log("registering handlebars helper: templateFilePath")
    return new Handlebars.SafeString(TEMPLATE_PATH[templateId]);
});
*/
