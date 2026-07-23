import { PageFactory } from "./PageFactory.js";
export class Notifications extends PageFactory {
    constructor() { super({ title: "Change Notifications", subtitle: "Notify stakeholders of cost or schedule impacts and track acknowledgement.", icon: "bell-ring", moduleKey: "notifications", routePath: "notifications", prefix: "CN" }); }
}
