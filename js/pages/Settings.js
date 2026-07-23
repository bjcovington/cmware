import { PageFactory } from "./PageFactory.js";
export class Settings extends PageFactory {
    constructor() { super({ title: "Project Settings", subtitle: "Configure companies, contacts, users, distribution lists, and project standards.", icon: "settings", actions: ["Add User", "Export"], moduleKey: "settings", routePath: "settings", prefix: "USR" }); }
}
