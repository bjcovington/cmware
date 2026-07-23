import { PageFactory } from "./PageFactory.js";
export class Search extends PageFactory {
    constructor() { super({ title: "Search", subtitle: "Search across RFIs, submittals, changes, logs, and project documents.", icon: "search", actions: ["Save Search", "Export"] }); }
}
