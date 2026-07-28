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
import { auth } from "./auth.js";

const PUBLIC_ROUTES = ["login", "signup"];

class ConstructionManagerApp {
    constructor(root) {
        this.root = root;
        this.router = new Router(routes, document);
        this.toast = new Toast();
        this.modal = new Modal();
        this.isAuthenticated = false;
    }

    init() {
        document.body.classList.toggle("dark", store.getState().theme === "dark");
        this.root.classList.toggle("sidebar-collapsed", store.getState().sidebarCollapsed);

        document.addEventListener("user-changed", () => {
            this.checkAuthAndRender();
        });

        window.addEventListener("hashchange", () => this.checkAuthAndRender());
        this.checkAuthAndRender();
        this.registerServiceWorker();
        window.lucide?.createIcons();
    }

    checkAuthAndRender() {
        const hash = location.hash.replace(/^#\/?/, "");
        const [path = "dashboard"] = hash.split("?");
        const route = routes.find(r => r.path === path) || routes[0];
        const isPublic = PUBLIC_ROUTES.includes(path);

        const currentUser = auth.getCurrentUser();
        this.isAuthenticated = !!currentUser;

        if (!this.isAuthenticated && !isPublic) {
            location.hash = "#/login";
            return;
        }

        if (this.isAuthenticated && isPublic) {
            location.hash = "#/dashboard";
            return;
        }

        if (this.isAuthenticated) {
            document.body.classList.toggle("dark", store.getState().theme === "dark");
            this.root.classList.toggle("sidebar-collapsed", store.getState().sidebarCollapsed);
            this.renderShell();
            this.router.mount(document.getElementById("app-main"), this.afterRoute.bind(this));
        } else {
            this.root.innerHTML = "";
            this.router.mount(this.root, this.afterRoute.bind(this));
        }
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
            },
            onProfile: () => this.openProfileModal()
        });
        this.toast.bind();
        this.modal.bind();

        document.addEventListener("open-modal", (event) => this.modal.open(event.detail));
        document.getElementById("fab-create")?.addEventListener("click", () => this.openCreateModal());
    }

    afterRoute(route) {
        document.title = `${route.title} | ${APP_NAME}`;
        document.querySelectorAll(".nav-link").forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${route.path}`);
        });
        document.getElementById("app-main")?.focus({ preventScroll: true });
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
            title: "Quick Create Document",
            body: `
                <div class="quick-create-grid">
                    <a class="quick-card" href="#/rfis">
                        <i data-lucide="message-square-plus"></i>
                        <strong>Request for Information (RFI)</strong>
                        <span>Design clarifications, field questions, and head-of-wall details.</span>
                    </a>
                    <a class="quick-card" href="#/submittals">
                        <i data-lucide="clipboard-list"></i>
                        <strong>Submittal Package</strong>
                        <span>Product data, shop drawings, samples, and mock-ups.</span>
                    </a>
                    <a class="quick-card" href="#/change-events">
                        <i data-lucide="triangle-alert"></i>
                        <strong>Change Event</strong>
                        <span>Field variances, cost exposure, and owner requests.</span>
                    </a>
                    <a class="quick-card" href="#/daily-logs">
                        <i data-lucide="calendar"></i>
                        <strong>Daily Field Log</strong>
                        <span>Site weather, trade manpower, and work progress.</span>
                    </a>
                    <a class="quick-card" href="#/drawings">
                        <i data-lucide="file-image"></i>
                        <strong>Drawing Sheet</strong>
                        <span>Add contract drawings or specification revisions.</span>
                    </a>
                    <a class="quick-card" href="#/punch-list">
                        <i data-lucide="check-square"></i>
                        <strong>Punch List Deficiencies</strong>
                        <span>Quality inspections and room deficiency tracking.</span>
                    </a>
                </div>
            `
        });
    }

    openProfileModal() {
        const currentUser = auth.getCurrentUser();
        const users = auth.getUsers();

        const body = `
            <div class="user-profile-shell">
                <div class="profile-header split">
                    <div class="cluster">
                        <div class="avatar-circle large">${currentUser.avatar || 'MV'}</div>
                        <div>
                            <h3>${currentUser.name}</h3>
                            <div class="badge info">${currentUser.role} &bull; ${currentUser.company}</div>
                            <div class="muted" style="margin-top: 2px;"><i data-lucide="mail"></i> ${currentUser.email}</div>
                        </div>
                    </div>
                    <button class="button small danger" id="btn-logout" type="button"><i data-lucide="log-out"></i> Log Out</button>
                </div>

                <div style="border-top: 1px solid var(--border-color); margin: 1rem 0; padding-top: 1rem;">
                    <h4>Switch User Account Session</h4>
                    <p class="muted">Select a simulated project contact profile to switch roles:</p>
                    <div class="user-switch-list" style="margin-top: 0.5rem;">
                        ${users.map((u) => `
                            <div class="user-switch-item split ${u.id === currentUser.id ? 'active-user' : ''}" data-switch-user-id="${u.id}">
                                <div class="cluster">
                                    <div class="avatar-circle">${u.avatar}</div>
                                    <div>
                                        <strong>${u.name} ${u.id === currentUser.id ? '(Active Session)' : ''}</strong>
                                        <div class="subtext">${u.role} &bull; ${u.company}</div>
                                    </div>
                                </div>
                                ${u.id !== currentUser.id ? `<button class="button small secondary" type="button">Switch</button>` : `<span class="badge success">Active</span>`}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div style="border-top: 1px solid var(--border-color); padding-top: 1rem;" class="split">
                    <span>Need to create a new user account?</span>
                    <button class="button small primary" id="btn-open-signup-form" type="button"><i data-lucide="user-plus"></i> Sign Up New User</button>
                </div>
            </div>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "User Profile & Account Session",
                body,
                onSubmit: null
            }
        }));

        setTimeout(() => {
            document.getElementById("btn-logout")?.addEventListener("click", () => {
                auth.logout();
                document.dispatchEvent(new CustomEvent("toast", { detail: "Logged out." }));
                document.getElementById("modal-close")?.click();
            });

            document.querySelectorAll("[data-switch-user-id]").forEach((el) => {
                el.addEventListener("click", () => {
                    const uId = el.dataset.switchUserId;
                    const found = users.find(u => u.id === uId);
                    if (found) {
                        auth.setCurrentUser(found);
                        document.dispatchEvent(new CustomEvent("toast", { detail: `Switched session to ${found.name}` }));
                        document.getElementById("modal-close")?.click();
                    }
                });
            });

            document.getElementById("btn-open-signup-form")?.addEventListener("click", () => {
                this.openSignupModal();
            });

            window.lucide?.createIcons();
        }, 50);
    }

    openSignupModal() {
        const body = `
            <form id="form-user-signup" class="record-form">
                <div class="field">
                    <label for="su-name">Full Name</label>
                    <input class="input" id="su-name" name="name" required placeholder="e.g. Alex Morgan">
                </div>
                <div class="field">
                    <label for="su-email">Email Address</label>
                    <input class="input" id="su-email" name="email" type="email" required placeholder="alex@apexconstruction.com">
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="su-company">Company</label>
                        <input class="input" id="su-company" name="company" required placeholder="e.g. Apex Construction">
                    </div>
                    <div class="field">
                        <label for="su-role">Role</label>
                        <input class="input" id="su-role" name="role" required placeholder="e.g. Project Engineer">
                    </div>
                </div>
                <div class="field">
                    <label for="su-pass">Password</label>
                    <input class="input" id="su-pass" name="password" type="password" value="password123" required>
                </div>
                <div class="split">
                    <span></span>
                    <button class="button primary" type="submit"><i data-lucide="check"></i> Create Account & Sign In</button>
                </div>
            </form>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "Sign Up New Account",
                body,
                onSubmit: async (values) => {
                    const res = await auth.signup(values);
                    if (res.success) {
                        document.dispatchEvent(new CustomEvent("toast", { detail: `Account created! Welcome, ${res.user.name}` }));
                    } else {
                        document.dispatchEvent(new CustomEvent("toast", { detail: res.message }));
                    }
                }
            }
        }));
    }

    registerServiceWorker() {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("./sw.js").catch(() => {});
        }
    }
}

new ConstructionManagerApp(document.getElementById("app")).init();
