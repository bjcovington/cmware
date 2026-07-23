import { PageFactory } from "./PageFactory.js";
export class Reports extends PageFactory {
    constructor() { super({ title: "Reports", subtitle: "Prepare executive snapshots, project controls summaries, and printable packages.", icon: "bar-chart-3", actions: ["Build Report", "Export"] }); }
}
