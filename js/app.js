import { APP_NAME, STORAGE_KEYS } from "./constants.js";
import { projects } from "./database.js";
import { store } from "./store.js";
import { Router } from "./router.js";
import { Sidebar } from "./components/Sidebar.js";
import { Navbar } from "./components/Navbar.js";
import { Toast } from "./components/Toast.js";
import { Modal } from "./components/Modal.js";
import { FloatingActionButton } from "./components/Button.js";
import { routes } from "./config.js";

class ConstructionManagerApp {
    constructor(root) {
        this.root = root;
        this.router = new Router(routes, document);
        this.toast = new Toast();
        this.modal = new Modal();
    }

    init() {
        document.body.classList.toggle("dark", store.getState().theme === "dark");
        this.root.classList.toggle("sidebar-collapsed", store.getState().sidebarCollapsed);
        this.renderShell();
        this.router.mount(document.getElementById("app-main"), this.afterRoute.bind(this));
        this.registerServiceWorker();
        window.lucide?.createIcons();
    }

    renderShell() {
        const sidebar = new Sidebar(routes);
        const navbar = new Navbar(projects);
        this.root.innerHTML = `
            ${sidebar.render()}
            <div class="main-panel">
                ${navbar.render()}
                <main id="app-main" class="content-shell" tabindex="-1"></main>
            </div>
            ${this.toast.render()}
            ${this.modal.render()}
            ${FloatingActionButton.render({ label: "Quick create", icon: "plus", id: "fab-create" })}
        `;

        sidebar.bind(this.root);
        navbar.bind({
            onMenu: () => this.toggleSidebar(),
            onTheme: () => this.toggleTheme(),
            onCreate: () => this.openCreateModal(),
            onSearch: (value) => {
                if (value.trim()) location.hash = `#/search?q=${encodeURIComponent(value.trim())}`;
            }
        });
        this.toast.bind();
        this.modal.bind();
        document.addEventListener("open-modal", (event) => this.modal.open(event.detail));
        document.getElementById("fab-create").addEventListener("click", () => this.openCreateModal());
    }

    afterRoute(route) {
        document.title = `${route.title} | ${APP_NAME}`;
        document.querySelectorAll(".nav-link").forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${route.path}`);
        });
        document.getElementById("app-main").focus({ preventScroll: true });
        window.lucide?.createIcons();
    }

    toggleSidebar() {
        const compact = window.matchMedia("(max-width: 920px)").matches;
        if (compact) {
            this.root.classList.toggle("sidebar-open");
            return;
        }
        store.setState({ sidebarCollapsed: !store.getState().sidebarCollapsed });
        localStorage.setItem(STORAGE_KEYS.sidebar, String(store.getState().sidebarCollapsed));
        this.root.classList.toggle("sidebar-collapsed", store.getState().sidebarCollapsed);
    }

    toggleTheme() {
        const theme = store.getState().theme === "dark" ? "light" : "dark";
        store.setState({ theme });
        localStorage.setItem(STORAGE_KEYS.theme, theme);
        document.body.classList.toggle("dark", theme === "dark");
    }

    openCreateModal() {
        this.modal.open({
            title: "Quick Create",
            body: `
                <div class="stack">
                    <a class="button primary" href="#/rfis"><i data-lucide="message-square-plus"></i>RFI</a>
                    <a class="button" href="#/submittals"><i data-lucide="clipboard-list"></i>Submittal</a>
                    <a class="button" href="#/change-events"><i data-lucide="file-plus-2"></i>Change Event</a>
                </div>
            `
        });
    }

    registerServiceWorker() {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("./sw.js").catch(() => {});
        }
    }
}

new ConstructionManagerApp(document.getElementById("app")).init();
