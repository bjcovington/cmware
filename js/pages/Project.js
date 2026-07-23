import { PageFactory } from "./PageFactory.js";
export class Project extends PageFactory {
    constructor() { super({ title: "Project", subtitle: "Overview, schedule, drawings, and specifications for the active project.", icon: "building-2" }); }
}
