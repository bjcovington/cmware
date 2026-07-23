import { Dropdown } from "./Dropdown.js";
import { SearchBar } from "./SearchBar.js";
import { store } from "../store.js";
import { STORAGE_KEYS } from "../constants.js";

export class Navbar {
    constructor(projects) {
        this.projects = projects;
    }

    render() {
        return `
            <header class="topbar">
                <button class="icon-button" id="menu-toggle" type="button" aria-label="Toggle sidebar"><i data-lucide="panel-left"></i></button>
                ${Dropdown.render({ label: "Project", options: this.projects, id: "project-select" })}
                ${SearchBar.render({ placeholder: "Search RFIs, submittals, drawings" })}
                <div class="cluster">
                    <button class="icon-button" type="button" aria-label="Notifications" title="Notifications"><i data-lucide="bell"></i></button>
                    <button class="icon-button" id="quick-create" type="button" aria-label="Quick create" title="Quick create"><i data-lucide="plus"></i></button>
                    <button class="icon-button" id="theme-toggle" type="button" aria-label="Toggle theme" title="Toggle theme"><i data-lucide="moon"></i></button>
                    <button class="icon-button" type="button" aria-label="User profile" title="User profile"><i data-lucide="circle-user-round"></i></button>
                </div>
            </header>
        `;
    }

    bind({ onMenu, onTheme, onCreate, onSearch }) {
        document.getElementById("menu-toggle").addEventListener("click", onMenu);
        document.getElementById("theme-toggle").addEventListener("click", onTheme);
        document.getElementById("quick-create").addEventListener("click", onCreate);
        const select = document.getElementById("project-select");
        select.value = store.getState().selectedProjectId;
        select.addEventListener("change", () => {
            store.setState({ selectedProjectId: select.value });
            localStorage.setItem(STORAGE_KEYS.project, select.value);
        });
        document.getElementById("global-search-form").addEventListener("submit", (event) => {
            event.preventDefault();
            onSearch(document.getElementById("global-search").value);
        });
    }
}
