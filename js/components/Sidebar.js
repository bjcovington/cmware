const groups = {
    Project: ["Overview", "Schedule", "Drawings", "Specifications"],
    Logs: ["RFI Log", "Submittal Register", "Change Log", "ASI Log", "CCD Log"],
    Administration: ["Companies", "Contacts", "Distribution Lists", "Users", "Project Settings"]
};

export class Sidebar {
    constructor(routes) {
        this.routes = routes;
    }

    render() {
        const sections = [...new Set(this.routes.map((route) => route.section))];
        return `
            <aside class="sidebar" aria-label="Primary navigation">
                <div class="brand">
                    <span class="brand-mark"><i data-lucide="hard-hat"></i></span>
                    <span class="brand-text"><strong>cmware</strong><span>Project controls</span></span>
                </div>
                <nav class="sidebar-nav">
                    ${sections.map((section) => this.renderSection(section)).join("")}
                </nav>
            </aside>
        `;
    }

    renderSection(section) {
        const routes = this.routes.filter((route) => route.section === section);
        if (groups[section]) {
            return `
                <div class="nav-group">
                    <button class="nav-group-button" type="button">
                        <i data-lucide="${routes[0]?.icon || "folder"}"></i><span class="nav-text">${section}</span><i class="nav-chevron" data-lucide="chevron-down"></i>
                    </button>
                    <div class="nav-children">
                        ${groups[section].map((item) => `<a class="nav-link" href="#/${item === "Project Settings" ? "settings" : section.toLowerCase()}"><i data-lucide="circle"></i><span class="nav-text">${item}</span></a>`).join("")}
                    </div>
                </div>
                ${routes.map((route) => this.renderLink(route)).join("")}
            `;
        }
        return `<div class="nav-section-label">${section}</div>${routes.map((route) => this.renderLink(route)).join("")}`;
    }

    renderLink(route) {
        return `<a class="nav-link" href="#/${route.path}"><i data-lucide="${route.icon}"></i><span class="nav-text">${route.title}</span></a>`;
    }

    bind(root) {
        root.querySelectorAll(".nav-group-button").forEach((button) => {
            button.addEventListener("click", () => button.closest(".nav-group").classList.toggle("closed"));
        });
        root.querySelector(".sidebar-nav").addEventListener("click", (event) => {
            if (event.target.closest(".nav-link") && window.matchMedia("(max-width: 920px)").matches) {
                root.classList.remove("sidebar-open");
            }
        });
    }
}
