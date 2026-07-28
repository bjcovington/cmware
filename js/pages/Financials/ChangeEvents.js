import { Card } from "../../components/Card.js";

const SEED_CHANGE_EVENTS = [
    { id: "ce-0033", number: "CE-0033", title: "Temporary power distribution relocation for ambulance bay", status: "Pricing", assignedTo: "Carlos Rodriguez", assignedCompany: "Volt Electric Inc.", cost: 84200, description: "Relocate temporary 400A distribution transformer", createdAt: "2026-07-18" },
    { id: "ce-0034", number: "CE-0034", title: "Additional firestopping at MEP penetrations Level 03", status: "Open", assignedTo: "Marcus Vance", assignedCompany: "Apex Construction", cost: 0, description: "Firestopping required at 47 additional penetrations identified during inspection", createdAt: "2026-07-20" },
    { id: "ce-0035", number: "CE-0035", title: "Canopy structural steel reinforcement for revised entry", status: "Approved", assignedTo: "Elena Rostova", assignedCompany: "Riverside Health Trust", cost: 184000, description: "Owner-requested canopy structural reinforcement at south entrance", createdAt: "2026-07-02" }
];

function getCurrentProjectId() {
    return localStorage.getItem("cm.selectedProject") || "RIV-104";
}

function getKey() {
    return `cmware_change_events_${getCurrentProjectId()}`;
}

function getChangeEvents() {
    const stored = localStorage.getItem(getKey());
    if (!stored) {
        localStorage.setItem(getKey(), JSON.stringify(SEED_CHANGE_EVENTS));
        return [...SEED_CHANGE_EVENTS];
    }
    try { return JSON.parse(stored); } catch { return [...SEED_CHANGE_EVENTS]; }
}

function setChangeEvents(data) {
    localStorage.setItem(getKey(), JSON.stringify(data));
}

function formatCurrency(val) {
    return "$" + Number(val).toLocaleString("en-US");
}

export class ChangeEvents {
    constructor() {
        this.searchTerm = "";
        this.currentStatus = "All";
    }

    render() {
        const items = getChangeEvents();
        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Financial Controls — Phase 3</span>
                    <h1>Change Events</h1>
                </div>
                <div class="toolbar">
                    <button class="button primary" id="btn-add-ce" type="button"><i data-lucide="plus"></i> Add Change Event</button>
                </div>
            </section>

            <div class="form-grid" style="margin-bottom: 1rem; max-width: 600px;">
                <div class="field">
                    <label>Search Change Events</label>
                    <div class="input-with-icon"><i data-lucide="search"></i><input class="input" id="ce-search" type="search" placeholder="Filter by number, title, assignee..."></div>
                </div>
                <div class="field">
                    <label>Status</label>
                    <select class="select" id="ce-status-filter">
                        <option value="All">All Statuses</option>
                        <option value="Open">Open</option>
                        <option value="Pricing">Pricing</option>
                        <option value="Approved">Approved</option>
                    </select>
                </div>
            </div>

            ${Card.render({
                title: "Change Events",
                eyebrow: `${items.length} change events`,
                body: `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Number</th>
                                    <th>Title</th>
                                    <th>Status</th>
                                    <th>Assigned To</th>
                                    <th>Company</th>
                                    <th style="text-align:right">Cost</th>
                                    <th>Date</th>
                                    <th style="text-align:right">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="ce-tbody">
                                ${this._renderRows(items)}
                            </tbody>
                        </table>
                    </div>
                `
            })}
        `;
    }

    _renderRows(items) {
        let filtered = items;
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(r =>
                r.number.toLowerCase().includes(term) ||
                r.title.toLowerCase().includes(term) ||
                r.assignedTo.toLowerCase().includes(term) ||
                r.assignedCompany.toLowerCase().includes(term)
            );
        }
        if (this.currentStatus !== "All") filtered = filtered.filter(r => r.status === this.currentStatus);

        return filtered.map(r => `
            <tr data-id="${r.id}">
                <td><strong class="text-primary">${r.number}</strong></td>
                <td>${r.title}</td>
                <td><span class="badge ${r.status === "Approved" ? "success" : r.status === "Pricing" ? "warning" : "neutral"}">${r.status}</span></td>
                <td>${r.assignedTo}</td>
                <td>${r.assignedCompany}</td>
                <td style="text-align:right">${r.cost > 0 ? formatCurrency(r.cost) : "—"}</td>
                <td>${r.createdAt}</td>
                <td style="text-align:right;">
                    <button class="button small ghost" type="button" data-action="edit-ce" data-id="${r.id}"><i data-lucide="edit-3"></i></button>
                    <button class="button small ghost danger" type="button" data-action="delete-ce" data-id="${r.id}"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `).join("");
    }

    bind() {
        document.getElementById("ce-search")?.addEventListener("input", (e) => {
            this.searchTerm = e.target.value;
            this._refreshTable();
        });

        document.getElementById("ce-status-filter")?.addEventListener("change", (e) => {
            this.currentStatus = e.target.value;
            this._refreshTable();
        });

        document.getElementById("btn-add-ce")?.addEventListener("click", () => this._openAddModal());

        this._bindActions();
        window.lucide?.createIcons();
    }

    _refreshTable() {
        const tbody = document.getElementById("ce-tbody");
        if (tbody) {
            tbody.innerHTML = this._renderRows(getChangeEvents());
            this._bindActions();
            window.lucide?.createIcons();
        }
    }

    _bindActions() {
        document.querySelectorAll("[data-action='edit-ce']").forEach(btn => {
            btn.addEventListener("click", () => {
                const item = getChangeEvents().find(r => r.id === btn.dataset.id);
                if (item) this._openEditModal(item);
            });
        });
        document.querySelectorAll("[data-action='delete-ce']").forEach(btn => {
            btn.addEventListener("click", () => {
                if (confirm(`Delete change event ${btn.dataset.id}?`)) {
                    const all = getChangeEvents().filter(r => r.id !== btn.dataset.id);
                    setChangeEvents(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Change event deleted" }));
                    this._refreshTable();
                }
            });
        });
    }

    _openAddModal() {
        const body = `
            <form id="form-add-ce" class="record-form">
                <div class="form-grid">
                    <div class="field">
                        <label for="ce-number">Number *</label>
                        <input class="input" id="ce-number" name="number" required placeholder="e.g. CE-0036">
                    </div>
                    <div class="field">
                        <label for="ce-status">Status *</label>
                        <select class="select" id="ce-status" name="status" required>
                            <option value="Open">Open</option>
                            <option value="Pricing">Pricing</option>
                            <option value="Approved">Approved</option>
                        </select>
                    </div>
                </div>
                <div class="field">
                    <label for="ce-title">Title *</label>
                    <input class="input" id="ce-title" name="title" required placeholder="Brief title">
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="ce-assigned">Assigned To *</label>
                        <input class="input" id="ce-assigned" name="assignedTo" required placeholder="Name">
                    </div>
                    <div class="field">
                        <label for="ce-company">Company *</label>
                        <input class="input" id="ce-company" name="assignedCompany" required placeholder="Company name">
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="ce-cost">Cost</label>
                        <input class="input" id="ce-cost" name="cost" type="number" value="0" placeholder="0">
                    </div>
                    <div class="field">
                        <label for="ce-date">Created Date</label>
                        <input class="input" id="ce-date" name="createdAt" type="date" value="${new Date().toISOString().split("T")[0]}">
                    </div>
                </div>
                <div class="field">
                    <label for="ce-desc">Description</label>
                    <input class="input" id="ce-desc" name="description" placeholder="Description">
                </div>
                <div class="split" style="margin-top: 0.75rem;">
                    <span></span>
                    <button class="button primary" type="submit"><i data-lucide="check"></i> Add Change Event</button>
                </div>
            </form>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "Add Change Event",
                body,
                onSubmit: (vals) => {
                    vals.cost = Number(vals.cost);
                    vals.id = "ce-" + Date.now();
                    const all = getChangeEvents();
                    all.unshift(vals);
                    setChangeEvents(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Change event added" }));
                }
            }
        }));
        setTimeout(() => window.lucide?.createIcons(), 50);
    }

    _openEditModal(item) {
        const body = `
            <form id="form-edit-ce" class="record-form">
                <div class="field">
                    <label>Number</label>
                    <input class="input" value="${item.number}" disabled>
                </div>
                <div class="field">
                    <label for="ceE-title">Title *</label>
                    <input class="input" id="ceE-title" name="title" value="${item.title}" required>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="ceE-status">Status *</label>
                        <select class="select" id="ceE-status" name="status" required>
                            <option value="Open"${item.status === "Open" ? " selected" : ""}>Open</option>
                            <option value="Pricing"${item.status === "Pricing" ? " selected" : ""}>Pricing</option>
                            <option value="Approved"${item.status === "Approved" ? " selected" : ""}>Approved</option>
                        </select>
                    </div>
                    <div class="field">
                        <label for="ceE-assigned">Assigned To *</label>
                        <input class="input" id="ceE-assigned" name="assignedTo" value="${item.assignedTo}" required>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="ceE-company">Company *</label>
                        <input class="input" id="ceE-company" name="assignedCompany" value="${item.assignedCompany}" required>
                    </div>
                    <div class="field">
                        <label for="ceE-cost">Cost</label>
                        <input class="input" id="ceE-cost" name="cost" type="number" value="${item.cost}">
                    </div>
                </div>
                <div class="field">
                    <label for="ceE-desc">Description</label>
                    <input class="input" id="ceE-desc" name="description" value="${item.description}">
                </div>
                <div class="split" style="margin-top: 0.75rem;">
                    <span></span>
                    <button class="button primary" type="submit"><i data-lucide="save"></i> Save Changes</button>
                </div>
            </form>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: `Edit ${item.number}`,
                body,
                onSubmit: (vals) => {
                    vals.cost = Number(vals.cost);
                    const all = getChangeEvents().map(r => r.id === item.id ? { ...r, ...vals } : r);
                    setChangeEvents(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `${item.number} updated` }));
                }
            }
        }));
        setTimeout(() => window.lucide?.createIcons(), 50);
    }
}
