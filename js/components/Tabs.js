export class Tabs {
    static render(tabs) {
        return `<div class="cluster" role="tablist">${tabs.map((tab, index) => `<button class="button ${index === 0 ? "primary" : ""}" role="tab">${tab}</button>`).join("")}</div>`;
    }
}
