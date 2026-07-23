import { recordStore } from "../recordStore.js";
import { Button } from "../components/Button.js";
import { Card } from "../components/Card.js";
import { Table } from "../components/Table.js";
import { Tabs } from "../components/Tabs.js";

const statusFlow = ["Draft", "Open", "Submitted", "In Review", "Pricing", "Issued", "Approved", "Closed"];

function toModuleKey(title) {
    return title.toLowerCase().replaceAll(" ", "-");
}

function toPrefix(title) {
    const matches = title.match(/[A-Z]/g);
    if (title === "Proposal Requests") return "PR";
    if (title === "Change Events") return "CE";
    if (title === "Change Orders") return "CO";
    if (matches?.length > 1) return matches.join("");
    return title.slice(0, 3).toUpperCase();
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export class PageFactory {
    constructor({ title, subtitle, icon = "folder-kanban", actions = ["New", "Export"], moduleKey, prefix }) {
        this.title = title;
        this.subtitle = subtitle;
        this.icon = icon;
        this.actions = actions;
        this.moduleKey = moduleKey || toModuleKey(title);
        this.prefix = prefix || toPrefix(title);
    }

    render({ params } = {}) {
        const query = params?.get("q") || "";
        const rows = this.moduleKey === "search" ? recordStore.search(query) : recordStore.byModule(this.moduleKey);
        const filteredRows = rows.filter((record) => this.matchesFilter(record, query));
        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Module</span>
                    <h1>${this.title}</h1>
                    <p>${this.subtitle}</p>
                </div>
                <div class="toolbar">
                    ${this.actions.map((action, index) => Button.render({
                        label: action,
                        icon: action.includes("Export") ? "download" : "plus",
                        variant: index === 0 ? "primary" : "",
                        id: `${this.moduleKey}-${action.toLowerCase().replaceAll(" ", "-")}`
                    })).join("")}
                </div>
            </section>
            ${Tabs.render(["All Items", "My Ball In Court", "Overdue", "Drafts"])}
            <section class="card register-tools">
                <label class="search-shell">
                    <i data-lucide="search"></i>
                    <input id="${this.moduleKey}-filter" type="search" value="${escapeHtml(query)}" placeholder="Filter this register">
                </label>
                <div class="record-summary">
                    <strong>${filteredRows.length}</strong>
                    <span class="muted">${filteredRows.length === 1 ? "record" : "records"}</span>
                </div>
            </section>
            ${Card.render({
                title: `${this.title} Register`,
                eyebrow: "Workspace",
                actions: `<button class="icon-button" type="button" aria-label="Filter"><i data-lucide="list-filter"></i></button>`,
                body: Table.render({ columns: ["Number", "Title", "Status", "Ball In Court", "Due"], rows: filteredRows, actions: this.moduleKey !== "search" })
            })}
            <section class="empty-state">
                <i data-lucide="${this.icon}"></i>
                <strong>${this.title} workflow is active.</strong>
                <p>Create records, advance status, export CSV data, and keep entries in browser storage while deeper collaboration features are added.</p>
            </section>
        `;
    }

    bind({ params } = {}) {
        const main = document.getElementById("app-main");
        const newButton = document.getElementById(`${this.moduleKey}-${this.actions[0].toLowerCase().replaceAll(" ", "-")}`);
        const exportButton = document.getElementById(`${this.moduleKey}-export`);
        const filter = document.getElementById(`${this.moduleKey}-filter`);

        newButton?.addEventListener("click", () => this.openCreateForm());
        exportButton?.addEventListener("click", () => this.exportCsv());

        filter?.addEventListener("input", () => {
            const next = filter.value.trim();
            if (this.moduleKey === "search") {
                location.hash = next ? `#/search?q=${encodeURIComponent(next)}` : "#/search";
                return;
            }
            const rows = recordStore.byModule(this.moduleKey).filter((record) => this.matchesFilter(record, next));
            const tableCard = main.querySelector(".card:nth-of-type(2)");
            if (tableCard) {
                tableCard.querySelector(".table-wrap").outerHTML = Table.render({
                    columns: ["Number", "Title", "Status", "Ball In Court", "Due"],
                    rows,
                    actions: true
                });
                main.querySelector(".record-summary strong").textContent = rows.length;
                window.lucide?.createIcons();
            }
        });

        main.addEventListener("click", (event) => {
            const button = event.target.closest("[data-action]");
            if (!button) return;

            if (button.dataset.action === "advance") {
                const record = recordStore.all().find((item) => item.id === button.dataset.recordId);
                const nextStatus = statusFlow[Math.min(statusFlow.indexOf(record.status) + 1, statusFlow.length - 1)] || "Closed";
                recordStore.updateStatus(record.id, nextStatus);
                document.dispatchEvent(new CustomEvent("toast", { detail: `${record.number} moved to ${nextStatus}` }));
                this.refresh(params);
            }

            if (button.dataset.action === "delete") {
                recordStore.remove(button.dataset.recordId);
                document.dispatchEvent(new CustomEvent("toast", { detail: "Record deleted" }));
                this.refresh(params);
            }
        });
    }

    openCreateForm() {
        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: `New ${this.title.slice(0, -1) || this.title}`,
                body: this.formMarkup(),
                onSubmit: (values) => {
                    const record = recordStore.create(this.moduleKey, values, this.prefix);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `${record.number} created` }));
                    this.refresh();
                }
            }
        }));
    }

    formMarkup() {
        return `
            <form class="record-form">
                <div class="field">
                    <label for="record-title">Title</label>
                    <input class="input" id="record-title" name="title" required placeholder="Short description">
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="record-status">Status</label>
                        <select class="select" id="record-status" name="status">
                            ${statusFlow.map((status) => `<option>${status}</option>`).join("")}
                        </select>
                    </div>
                    <div class="field">
                        <label for="record-priority">Priority</label>
                        <select class="select" id="record-priority" name="priority">
                            <option>Normal</option>
                            <option>High</option>
                            <option>Critical</option>
                            <option>Low</option>
                        </select>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="record-ball">Ball In Court</label>
                        <input class="input" id="record-ball" name="ballInCourt" placeholder="Architect, Engineer, Owner">
                    </div>
                    <div class="field">
                        <label for="record-due">Due Date</label>
                        <input class="input" id="record-due" name="due" type="date">
                    </div>
                </div>
                <div class="field">
                    <label for="record-cost">Cost Impact</label>
                    <input class="input" id="record-cost" name="cost" type="number" min="0" step="1" placeholder="0">
                </div>
                <div class="field">
                    <label for="record-description">Description</label>
                    <textarea class="textarea" id="record-description" name="description" placeholder="Scope, question, drawing reference, or review notes"></textarea>
                </div>
                <div class="split">
                    <span class="muted">Next number: ${this.prefix}-####</span>
                    ${Button.render({ label: "Create", icon: "check", variant: "primary", type: "submit" })}
                </div>
            </form>
        `;
    }

    matchesFilter(record, query) {
        const term = String(query || "").trim().toLowerCase();
        if (!term) return true;
        return [record.number, record.title, record.status, record.ballInCourt, record.due, record.description]
            .some((value) => String(value || "").toLowerCase().includes(term));
    }

    exportCsv() {
        const rows = recordStore.byModule(this.moduleKey);
        const header = ["Number", "Title", "Status", "Ball In Court", "Due", "Priority", "Cost", "Description"];
        const csvRows = rows.map((record) => [record.number, record.title, record.status, record.ballInCourt, record.due, record.priority, record.cost || 0, record.description]);
        const csv = [header, ...csvRows]
            .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${this.moduleKey}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    refresh(params) {
        const hash = location.hash || `#/${this.moduleKey}`;
        location.hash = hash.includes("?") ? hash : `#/${this.moduleKey}`;
        document.getElementById("app-main").innerHTML = this.render({ params });
        this.bind({ params });
        window.lucide?.createIcons();
    }
}
