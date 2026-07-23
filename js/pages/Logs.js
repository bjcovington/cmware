import { PageFactory } from "./PageFactory.js";
export class Logs extends PageFactory {
    constructor() { super({ title: "Logs", subtitle: "Review RFI, submittal, change, ASI, and CCD logs in a consolidated view.", icon: "list-checks", actions: ["Add Log Entry", "Export"] }); }
}
