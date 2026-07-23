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
                    <span class="brand-text"><strong>cmware</strong><span>Commercial Controls</span></span>
                </div>
                <nav class="sidebar-nav">
                    ${sections.map((section) => this.renderSection(section)).join("")}
                </nav>
            </aside>
        `;
    }

    renderSection(section) {
        const routes = this.routes.filter((route) => route.section === section);
        return `
            <div class="nav-section-label">${section}</div>
            ${routes.map((route) => this.renderLink(route)).join("")}
        `;
    }

    renderLink(route) {
        return `
            <a class="nav-link" href="#/${route.path}">
                <i data-lucide="${route.icon}"></i>
                <span class="nav-text">${route.title}</span>
            </a>
        `;
    }

    bind(root) {
        root.querySelector(".sidebar-nav")?.addEventListener("click", (event) => {
            if (event.target.closest(".nav-link") && window.matchMedia("(max-width: 920px)").matches) {
                root.classList.remove("sidebar-open");
            }
        });
    }
}
