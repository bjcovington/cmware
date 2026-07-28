import { Card } from "../../components/Card.js";

const SEED_OCOS = [
    { id: "oco-001", number: "OCO-001", title: "South Entrance Canopy Structural Revisions", status: "Approved", linkedPCO: "PCO-003", amount: 184000, executedDate: "2026-07-05" },
    { id: "oco-002", number: "OCO-002", title: "Temporary Power Relocation Owner Approval", status: "Draft", linkedPCO: "PCO-001", amount: 92500, executedDate: "" }
];

function getCurrentProjectId() {
    return localStorage.getItem("cm.selectedProject") || "RIV-104";
}

function getKey() {
    return `cmware_owner_cos_${getCurrentProjectId()}`;
}

function getOCOs() {
    const stored = localStorage.getItem(getKey());
    if (!stored) {
        localStorage.setItem(getKey(), JSON.stringify(SEED_OCOS));
        return [...SEED_OCOS];
    }
    try { return JSON.parse(stored); } catch { return [...SEED_OCOS]; }
}

function setOCOs(data) {
    localStorage.setItem(getKey(), JSON.stringify(data));
}

function formatCurrency(val) {
    return "$" + Number(val).toLocaleString("en-US");
}

export class OwnerChangeOrders {
    constructor() {
        this.searchTerm = "";
        this.currentStatus = "All";
    }

    render() {
        const items = getOCOs();
        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Financial Controls — Phase 3</span>
                    <h1>Owner Change Orders</h1>
                </div>
                <div class="toolbar">
                    <button class="button primary" id="btn-add-oco" type="button"><i data-lucide="plus"></i> Add Owner CO</button>
                </div>
            </section>

            <div class="form-grid" style="margin-bottom: 1rem; max-width: 600px;">
                <div class="field">
                    <label>Search Owner COs</label>
                    <div class="input-with-icon"><i data-lucide="search"></i><input class="input" id="oco-search" type="search" placeholder="Filter by number, title, linked PCO..."></div>
                </div>
                <div class="field">
                    <label>Status</label>
                    <select class="select" id="oco-status-filter">
                        <option value="All">All Statuses</option>
                        <option value="Draft">Draft</option>
                        <option value="Approved">Approved</option>
                    </select>
                </div>
            </div>

            ${Card.render({
                title: "Owner Change Orders",
                eyebrow: `${items.length} owner change orders`,
                body: `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Number</th>
                                    <th>Title</th>
                                    <th>Status</th>
                                    <th>Linked PCO</th>
                                    <th style="text-align:right">Amount</th>
                                    <th>Executed Date</th>
                                    <th style="text-align:right">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="oco-tbody">
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
                r.linkedPCO.toLowerCase().includes(term)
            );
        }
        if (this.currentStatus !== "All") filtered = filtered.filter(r => r.status === this.currentStatus);

        return filtered.map(r => `
            <tr data-id="${r.id}">
                <td><strong class="text-primary">${r.number}</strong></td>
                <td>${r.title}</td>
                <td><span class="badge ${r.status === "Approved" ? "success" : "neutral"}">${r.status}</span></td>
                <td><span class="badge neutral">${r.linkedPCO}</span></td>
                <td style="text-align:right"><strong>${formatCurrency(r.amount)}</strong></td>
                <td>${r.executedDate || "—"}</td>
                <td style="text-align:right;">
                    <button class="button small ghost" type="button" data-action="edit-oco" data-id="${r.id}"><i data-lucide="edit-3"></i></button>
                    <button class="button small ghost danger" type="button" data-action="delete-oco" data-id="${r.id}"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `).join("");
    }

    bind() {
        document.getElementById("oco-search")?.addEventListener("input", (e) => {
            this.searchTerm = e.target.value;
            this._refreshTable();
        });

        document.getElementById("oco-status-filter")?.addEventListener("change", (e) => {
            this.currentStatus = e.target.value;
            this._refreshTable();
        });

        document.getElementById("btn-add-oco")?.addEventListener("click", () => this._openAddModal());

        this._bindActions();
        window.lucide?.createIcons();
    }

    _refreshTable() {
        const tbody = document.getElementById("oco-tbody");
        if (tbody) {
            tbody.innerHTML = this._renderRows(getOCOs());
            this._bindActions();
            window.lucide?.createIcons();
        }
    }

    _bindActions() {
        document.querySelectorAll("[data-action='edit-oco']").forEach(btn => {
            btn.addEventListener("click", () => {
                const item = getOCOs().find(r => r.id === btn.dataset.id);
                if (item) this._openEditModal(item);
            });
        });
        document.querySelectorAll("[data-action='delete-oco']").forEach(btn => {
            btn.addEventListener("click", () => {
                if (confirm(`Delete owner CO ${btn.dataset.id}?`)) {
                    const all = getOCOs().filter(r => r.id !== btn.dataset.id);
                    setOCOs(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Owner CO deleted" }));
                    this._refreshTable();
                }
            });
        });
    }

    _openAddModal() {
        const body = `
            <form id="form-add-oco" class="record-form">
                <div class="form-grid">
                    <div class="field">
                        <label for="oco-number">Number *</label>
                        <input class="input" id="oco-number" name="number" required placeholder="e.g. OCO-003">
                    </div>
                    <div class="field">
                        <label for="oco-status">Status *</label>
                        <select class="select" id="oco-status" name="status" required>
                            <option value="Draft">Draft</option>
                            <option value="Approved">Approved</option>
                        </select>
                    </div>
                </div>
                <div class="field">
                    <label for="oco-title">Title *</label>
                    <input class="input" id="oco-title" name="title" required placeholder="Brief title">
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="oco-linked">Linked PCO</label>
                        <input class="input" id="oco-linked" name="linkedPCO" placeholder="e.g. PCO-004">
                    </div>
                    <div class="field">
                        <label for="oco-amount">Amount *</label>
                        <input class="input" id="oco-amount" name="amount" type="number" required placeholder="0">
                    </div>
                </div>
                <div class="field">
                    <label for="oco-date">Executed Date</label>
                    <input class="input" id="oco-date" name="executedDate" type="date">
                </div>
                <div class="split" style="margin-top: 0.75rem;">
                    <span></span>
                    <button class="button primary" type="submit"><i data-lucide="check"></i> Add Owner CO</button>
                </div>
            </form>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "Add Owner Change Order",
                body,
                onSubmit: (vals) => {
                    vals.amount = Number(vals.amount);
                    vals.id = "oco-" + Date.now();
                    const all = getOCOs();
                    all.unshift(vals);
                    setOCOs(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Owner CO added" }));
                }
            }
        }));
        setTimeout(() => window.lucide?.createIcons(), 50);
    }

    _openEditModal(item) {
        const body = `
            <form id="form-edit-oco" class="record-form">
                <div class="field">
                    <label>Number</label>
                    <input class="input" value="${item.number}" disabled>
                </div>
                <div class="field">
                    <label for="ocoE-title">Title *</label>
                    <input class="input" id="ocoE-title" name="title" value="${item.title}" required>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="ocoE-status">Status *</label>
                        <select class="select" id="ocoE-status" name="status" required>
                            <option value="Draft"${item.status === "Draft" ? " selected" : ""}>Draft</option>
                            <option value="Approved"${item.status === "Approved" ? " selected" : ""}>Approved</option>
                        </select>
                    </div>
                    <div class="field">
                        <label for="ocoE-linked">Linked PCO</label>
                        <input class="input" id="ocoE-linked" name="linkedPCO" value="${item.linkedPCO}">
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="ocoE-amount">Amount *</label>
                        <input class="input" id="ocoE-amount" name="amount" type="number" value="${item.amount}" required>
                    </div>
                    <div class="field">
                        <label for="ocoE-date">Executed Date</label>
                        <input class="input" id="ocoE-date" name="executedDate" type="date" value="${item.executedDate}">
                    </div>
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
                    vals.amount = Number(vals.amount);
                    const all = getOCOs().map(r => r.id === item.id ? { ...r, ...vals } : r);
                    setOCOs(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `${item.number} updated` }));
                }
            }
        }));
        setTimeout(() => window.lucide?.createIcons(), 50);
    }
}
