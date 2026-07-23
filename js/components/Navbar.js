import { Dropdown } from "./Dropdown.js";
import { SearchBar } from "./SearchBar.js";
import { store } from "../store.js";
import { STORAGE_KEYS } from "../constants.js";
import { auth } from "../auth.js";

export class Navbar {
    constructor(projects) {
        this.projects = projects;
    }

    render() {
        const currentUser = auth.getCurrentUser();

        return `
            <header class="topbar">
                <button class="icon-button" id="menu-toggle" type="button" aria-label="Toggle sidebar"><i data-lucide="panel-left"></i></button>
                ${Dropdown.render({ label: "Project", options: this.projects, id: "project-select" })}
                ${SearchBar.render({ placeholder: "Search RFIs, submittals, drawings, specs, change orders..." })}
                <div class="cluster">
                    <button class="icon-button" type="button" aria-label="Notifications" title="Notifications" onclick="document.dispatchEvent(new CustomEvent('toast', { detail: '3 unread project notifications' }))"><i data-lucide="bell"></i></button>
                    <button class="icon-button primary" id="quick-create" type="button" aria-label="Quick create" title="Quick create"><i data-lucide="plus"></i></button>
                    <button class="icon-button" id="theme-toggle" type="button" aria-label="Toggle theme" title="Toggle theme"><i data-lucide="moon"></i></button>
                    <button class="user-avatar-btn" id="user-profile-btn" type="button" title="${currentUser.name} (${currentUser.role})">
                        <span>${currentUser.avatar || 'MV'}</span>
                    </button>
                </div>
            </header>
        `;
    }

    bind({ onMenu, onTheme, onCreate, onSearch, onProfile }) {
        document.getElementById("menu-toggle")?.addEventListener("click", onMenu);
        document.getElementById("theme-toggle")?.addEventListener("click", onTheme);
        document.getElementById("quick-create")?.addEventListener("click", onCreate);
        document.getElementById("user-profile-btn")?.addEventListener("click", onProfile);

        const select = document.getElementById("project-select");
        if (select) {
            select.value = store.getState().selectedProjectId;
            select.addEventListener("change", () => {
                store.setState({ selectedProjectId: select.value });
                localStorage.setItem(STORAGE_KEYS.project, select.value);
                document.dispatchEvent(new CustomEvent("toast", { detail: `Switched project context` }));
            });
        }

        document.getElementById("global-search-form")?.addEventListener("submit", (event) => {
            event.preventDefault();
            onSearch(document.getElementById("global-search").value);
        });
    }
}
