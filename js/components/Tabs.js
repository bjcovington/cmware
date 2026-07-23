export class Tabs {
    static render(tabs, activeTab = null) {
        return `
            <div class="tab-list-wrap">
                <div class="tab-list" role="tablist">
                    ${tabs.map((tab, index) => `
                        <button
                            class="tab-button ${activeTab ? (tab === activeTab ? "active" : "") : (index === 0 ? "active" : "")}"
                            role="tab"
                            type="button"
                            aria-selected="${activeTab ? (tab === activeTab ? "true" : "false") : (index === 0 ? "true" : "false")}"
                            data-tab="${tab}"
                        >${tab}</button>
                    `).join("")}
                </div>
            </div>
        `;
    }
}
