import { Card } from "../../components/Card.js";

function getCurrentProjectId() {
    return localStorage.getItem("cm.selectedProject") || "RIV-104";
}

function getKey() {
    return `cmware_sub_cos_${getCurrentProjectId()}`;
}

const SEED_DATA = [
    { id: "sco-001", number: "SCO-001", title: "Concrete Scope Addition - Ambulance Ramp", status: "Executed", subcontractor: "Hardrock Concrete LLC", linkedSCO: "PCO-002", amount: 45000, description: "Additional concrete work for ambulance ramp retaining wall" },
    { id: "sco-002", number: "SCO-002", title: "Panel Color Change - South Elevation", status: "Draft", subcontractor: "Exterior Concepts LLC", linkedSCO: "", amount: 12000, description: "Change panel finish from metallic silver to charcoal metallic" }
];

function getData() {
    const stored = localStorage.getItem(getKey());
    if (!stored) {
        localStorage.setItem(getKey(), JSON.stringify(SEED_DATA));
        return [...SEED_DATA];
    }
    try { return JSON.parse(stored); } catch { return [...SEED_DATA]; }
}

function setData(data) {
    localStorage.setItem(getKey(), JSON.stringify(data));
    document.dispatchEvent(new CustomEvent("sub-cos-changed"));
}

function formatCurrency(val) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
}

const SCO_STATUSES = ["Draft", "Submitted", "Approved", "Rejected", "Executed"];

export class SubcontractChangeOrders {
    constructor() {
        this.searchTerm = "";
        this.currentStatus = "All";
    }

    render() {
        const rows = getData();

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Financial Controls — Phase 3</span>
                    <h1>Subcontract Change Orders</h1>
                </div>
                <div class="toolbar">
                    <button class="button primary" id="btn-add-sco" type="button"><i data-lucide="plus"></i> Add Change Order</button>
                </div>
            </section>

            <div class="form-grid" style="margin-bottom: 1rem; max-width: 600px;">
                <div class="field">
                    <label>Search</label>
                    <div class="input-with-icon"><i data-lucide="search"></i><input class="input" id="sco-search" type="search" placeholder="Filter by number, title, subcontractor..."></div>
                </div>
                <div class="field">
                    <label>Status</label>
                    <select class="select" id="sco-status-filter">
                        <option value="All">All Statuses</option>
                        ${SCO_STATUSES.map(s => `<option value="${s}">${s}</option>`).join("")}
                    </select>
                </div>
            </div>

            ${Card.render({
                title: "Subcontract Change Orders",
                eyebrow: `${rows.length} records`,
                body: `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Number</th>
                                    <th>Title</th>
                                    <th>Status</th>
                                    <th>Subcontractor</th>
                                    <th style="text-align: right;">Amount</th>
                                    <th>Description</th>
                                    <th style="text-align: right;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="sco-tbody">
                                ${this._renderRows(rows)}
                            </tbody>
                        </table>
                    </div>
                `
            })}
        `;
    }

    _renderRows(rows) {
        let filtered = rows;
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(r =>
                r.number.toLowerCase().includes(term) ||
                r.title.toLowerCase().includes(term) ||
                r.subcontractor.toLowerCase().includes(term)
            );
        }
        if (this.currentStatus !== "All") filtered = filtered.filter(r => r.status === this.currentStatus);

        return filtered.map(r => `
            <tr data-id="${r.id}">
                <td><strong class="text-primary">${r.number}</strong></td>
                <td>${r.title}</td>
                <td><span class="badge ${r.status === "Executed" ? "success" : r.status === "Draft" ? "neutral" : "warning"}">${r.status}</span></td>
                <td>${r.subcontractor}</td>
                <td style="text-align: right;">${formatCurrency(r.amount)}</td>
                <td>${r.description}</td>
                <td style="text-align: right;">
                    <button class="button small ghost" type="button" data-action="edit-sco" data-id="${r.id}"><i data-lucide="edit-3"></i></button>
                    <button class="button small ghost danger" type="button" data-action="delete-sco" data-id="${r.id}"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `).join("");
    }

    bind() {
        document.getElementById("sco-search")?.addEventListener("input", (e) => {
            this.searchTerm = e.target.value;
            this._refreshTable();
        });

        document.getElementById("sco-status-filter")?.addEventListener("change", (e) => {
            this.currentStatus = e.target.value;
            this._refreshTable();
        });

        document.getElementById("btn-add-sco")?.addEventListener("click", () => this._openAddModal());

        this._bindActions();
        window.lucide?.createIcons();
    }

    _refreshTable() {
        const tbody = document.getElementById("sco-tbody");
        if (tbody) {
            tbody.innerHTML = this._renderRows(getData());
            this._bindActions();
            window.lucide?.createIcons();
        }
    }

    _bindActions() {
        document.querySelectorAll("[data-action='edit-sco']").forEach(btn => {
            btn.addEventListener("click", () => {
                const item = getData().find(r => r.id === btn.dataset.id);
                if (item) this._openEditModal(item);
            });
        });

        document.querySelectorAll("[data-action='delete-sco']").forEach(btn => {
            btn.addEventListener("click", () => {
                if (confirm(`Delete change order ${btn.dataset.id}?`)) {
                    const all = getData().filter(r => r.id !== btn.dataset.id);
                    setData(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Change order deleted" }));
                    this._refreshTable();
                }
            });
        });
    }

    _openAddModal() {
        const body = `
            <form id="form-add-sco" class="record-form">
                <div class="form-grid">
                    <div class="field">
                        <label for="sco-number">Number *</label>
                        <input class="input" id="sco-number" name="number" required placeholder="e.g. SCO-003">
                    </div>
                    <div class="field">
                        <label for="sco-status">Status *</label>
                        <select class="select" id="sco-status" name="status" required>
                            ${SCO_STATUSES.map(s => `<option value="${s}">${s}</option>`).join("")}
                        </select>
                    </div>
                </div>
                <div class="field">
                    <label for="sco-title">Title *</label>
                    <input class="input" id="sco-title" name="title" required placeholder="Brief description of the change">
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="sco-subcontractor">Subcontractor *</label>
                        <input class="input" id="sco-subcontractor" name="subcontractor" required placeholder="e.g. Hardrock Concrete LLC">
                    </div>
                    <div class="field">
                        <label for="sco-linked">Linked PCO</label>
                        <input class="input" id="sco-linked" name="linkedSCO" placeholder="e.g. PCO-002">
                    </div>
                </div>
                <div class="field">
                    <label for="sco-amount">Amount ($) *</label>
                    <input class="input" id="sco-amount" name="amount" type="number" min="0" required placeholder="0">
                </div>
                <div class="field">
                    <label for="sco-desc">Description</label>
                    <input class="input" id="sco-desc" name="description" placeholder="Details of the change">
                </div>
                <div class="split" style="margin-top: 0.75rem;">
                    <span></span>
                    <button class="button primary" type="submit"><i data-lucide="check"></i> Add Change Order</button>
                </div>
            </form>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "Add Subcontract Change Order",
                body,
                onSubmit: (vals) => {
                    vals.id = "sco-" + Date.now();
                    vals.amount = Number(vals.amount) || 0;
                    const all = getData();
                    all.unshift(vals);
                    setData(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `Change order ${vals.number} added` }));
                }
            }
        }));

        setTimeout(() => window.lucide?.createIcons(), 50);
    }

    _openEditModal(item) {
        const body = `
            <form id="form-edit-sco" class="record-form">
                <div class="field">
                    <label>Number</label>
                    <input class="input" value="${item.number}" disabled>
                </div>
                <div class="field">
                    <label for="scoE-title">Title *</label>
                    <input class="input" id="scoE-title" name="title" value="${item.title}" required>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="scoE-status">Status *</label>
                        <select class="select" id="scoE-status" name="status" required>
                            ${SCO_STATUSES.map(s => `<option value="${s}"${item.status === s ? " selected" : ""}>${s}</option>`).join("")}
                        </select>
                    </div>
                    <div class="field">
                        <label for="scoE-subcontractor">Subcontractor *</label>
                        <input class="input" id="scoE-subcontractor" name="subcontractor" value="${item.subcontractor}" required>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="scoE-linked">Linked PCO</label>
                        <input class="input" id="scoE-linked" name="linkedSCO" value="${item.linkedSCO}">
                    </div>
                    <div class="field">
                        <label for="scoE-amount">Amount ($) *</label>
                        <input class="input" id="scoE-amount" name="amount" type="number" min="0" value="${item.amount}" required>
                    </div>
                </div>
                <div class="field">
                    <label for="scoE-desc">Description</label>
                    <input class="input" id="scoE-desc" name="description" value="${item.description}">
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
                    vals.amount = Number(vals.amount) || 0;
                    const all = getData().map(r => r.id === item.id ? { ...r, ...vals } : r);
                    setData(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `${item.number} updated` }));
                }
            }
        }));

        setTimeout(() => window.lucide?.createIcons(), 50);
    }
}
