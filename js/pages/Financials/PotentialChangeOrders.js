import { Card } from "../../components/Card.js";

const SEED_PCOS = [
    { id: "pco-001", number: "PCO-001", title: "Temporary Power Relocation", status: "Submitted to Owner", linkedCE: "CE-0033", amount: 92500, description: "Incl mobilization, materials, and labor for 400A dist panel relocation" },
    { id: "pco-002", number: "PCO-002", title: "Additional Firestopping Scope", status: "Draft", linkedCE: "CE-0034", amount: 38000, description: "Firestopping at 47 additional MEP penetrations per inspection report" },
    { id: "pco-003", number: "PCO-003", title: "Canopy Steel Reinforcement", status: "Approved", linkedCE: "CE-0035", amount: 184000, description: "Structural steel reinforcement for revised south entrance canopy" }
];

function getCurrentProjectId() {
    return localStorage.getItem("cm.selectedProject") || "RIV-104";
}

function getKey() {
    return `cmware_pcos_${getCurrentProjectId()}`;
}

function getPCOs() {
    const stored = localStorage.getItem(getKey());
    if (!stored) {
        localStorage.setItem(getKey(), JSON.stringify(SEED_PCOS));
        return [...SEED_PCOS];
    }
    try { return JSON.parse(stored); } catch { return [...SEED_PCOS]; }
}

function setPCOs(data) {
    localStorage.setItem(getKey(), JSON.stringify(data));
}

function formatCurrency(val) {
    return "$" + Number(val).toLocaleString("en-US");
}

export class PotentialChangeOrders {
    constructor() {
        this.searchTerm = "";
        this.currentStatus = "All";
    }

    render() {
        const items = getPCOs();
        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Financial Controls — Phase 3</span>
                    <h1>Potential Change Orders (PCOs)</h1>
                </div>
                <div class="toolbar">
                    <button class="button primary" id="btn-add-pco" type="button"><i data-lucide="plus"></i> Add PCO</button>
                </div>
            </section>

            <div class="form-grid" style="margin-bottom: 1rem; max-width: 600px;">
                <div class="field">
                    <label>Search PCOs</label>
                    <div class="input-with-icon"><i data-lucide="search"></i><input class="input" id="pco-search" type="search" placeholder="Filter by number, title, linked CE..."></div>
                </div>
                <div class="field">
                    <label>Status</label>
                    <select class="select" id="pco-status-filter">
                        <option value="All">All Statuses</option>
                        <option value="Draft">Draft</option>
                        <option value="Submitted to Owner">Submitted to Owner</option>
                        <option value="Approved">Approved</option>
                    </select>
                </div>
            </div>

            ${Card.render({
                title: "Potential Change Orders (PCOs)",
                eyebrow: `${items.length} PCOs`,
                body: `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Number</th>
                                    <th>Title</th>
                                    <th>Status</th>
                                    <th>Linked CE</th>
                                    <th style="text-align:right">Amount</th>
                                    <th>Description</th>
                                    <th style="text-align:right">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="pco-tbody">
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
                r.linkedCE.toLowerCase().includes(term)
            );
        }
        if (this.currentStatus !== "All") filtered = filtered.filter(r => r.status === this.currentStatus);

        return filtered.map(r => `
            <tr data-id="${r.id}">
                <td><strong class="text-primary">${r.number}</strong></td>
                <td>${r.title}</td>
                <td><span class="badge ${r.status === "Approved" ? "success" : r.status === "Submitted to Owner" ? "warning" : "neutral"}">${r.status}</span></td>
                <td><span class="badge neutral">${r.linkedCE}</span></td>
                <td style="text-align:right"><strong>${formatCurrency(r.amount)}</strong></td>
                <td>${r.description}</td>
                <td style="text-align:right;">
                    <button class="button small ghost" type="button" data-action="edit-pco" data-id="${r.id}"><i data-lucide="edit-3"></i></button>
                    <button class="button small ghost danger" type="button" data-action="delete-pco" data-id="${r.id}"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `).join("");
    }

    bind() {
        document.getElementById("pco-search")?.addEventListener("input", (e) => {
            this.searchTerm = e.target.value;
            this._refreshTable();
        });

        document.getElementById("pco-status-filter")?.addEventListener("change", (e) => {
            this.currentStatus = e.target.value;
            this._refreshTable();
        });

        document.getElementById("btn-add-pco")?.addEventListener("click", () => this._openAddModal());

        this._bindActions();
        window.lucide?.createIcons();
    }

    _refreshTable() {
        const tbody = document.getElementById("pco-tbody");
        if (tbody) {
            tbody.innerHTML = this._renderRows(getPCOs());
            this._bindActions();
            window.lucide?.createIcons();
        }
    }

    _bindActions() {
        document.querySelectorAll("[data-action='edit-pco']").forEach(btn => {
            btn.addEventListener("click", () => {
                const item = getPCOs().find(r => r.id === btn.dataset.id);
                if (item) this._openEditModal(item);
            });
        });
        document.querySelectorAll("[data-action='delete-pco']").forEach(btn => {
            btn.addEventListener("click", () => {
                if (confirm(`Delete PCO ${btn.dataset.id}?`)) {
                    const all = getPCOs().filter(r => r.id !== btn.dataset.id);
                    setPCOs(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: "PCO deleted" }));
                    this._refreshTable();
                }
            });
        });
    }

    _openAddModal() {
        const body = `
            <form id="form-add-pco" class="record-form">
                <div class="form-grid">
                    <div class="field">
                        <label for="pco-number">Number *</label>
                        <input class="input" id="pco-number" name="number" required placeholder="e.g. PCO-004">
                    </div>
                    <div class="field">
                        <label for="pco-status">Status *</label>
                        <select class="select" id="pco-status" name="status" required>
                            <option value="Draft">Draft</option>
                            <option value="Submitted to Owner">Submitted to Owner</option>
                            <option value="Approved">Approved</option>
                        </select>
                    </div>
                </div>
                <div class="field">
                    <label for="pco-title">Title *</label>
                    <input class="input" id="pco-title" name="title" required placeholder="Brief title">
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="pco-linked">Linked CE</label>
                        <input class="input" id="pco-linked" name="linkedCE" placeholder="e.g. CE-0033">
                    </div>
                    <div class="field">
                        <label for="pco-amount">Amount *</label>
                        <input class="input" id="pco-amount" name="amount" type="number" required placeholder="0">
                    </div>
                </div>
                <div class="field">
                    <label for="pco-desc">Description</label>
                    <input class="input" id="pco-desc" name="description" placeholder="Description">
                </div>
                <div class="split" style="margin-top: 0.75rem;">
                    <span></span>
                    <button class="button primary" type="submit"><i data-lucide="check"></i> Add PCO</button>
                </div>
            </form>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "Add Potential Change Order",
                body,
                onSubmit: (vals) => {
                    vals.amount = Number(vals.amount);
                    vals.id = "pco-" + Date.now();
                    const all = getPCOs();
                    all.unshift(vals);
                    setPCOs(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: "PCO added" }));
                }
            }
        }));
        setTimeout(() => window.lucide?.createIcons(), 50);
    }

    _openEditModal(item) {
        const body = `
            <form id="form-edit-pco" class="record-form">
                <div class="field">
                    <label>Number</label>
                    <input class="input" value="${item.number}" disabled>
                </div>
                <div class="field">
                    <label for="pcoE-title">Title *</label>
                    <input class="input" id="pcoE-title" name="title" value="${item.title}" required>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="pcoE-status">Status *</label>
                        <select class="select" id="pcoE-status" name="status" required>
                            <option value="Draft"${item.status === "Draft" ? " selected" : ""}>Draft</option>
                            <option value="Submitted to Owner"${item.status === "Submitted to Owner" ? " selected" : ""}>Submitted to Owner</option>
                            <option value="Approved"${item.status === "Approved" ? " selected" : ""}>Approved</option>
                        </select>
                    </div>
                    <div class="field">
                        <label for="pcoE-linked">Linked CE</label>
                        <input class="input" id="pcoE-linked" name="linkedCE" value="${item.linkedCE}">
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="pcoE-amount">Amount *</label>
                        <input class="input" id="pcoE-amount" name="amount" type="number" value="${item.amount}" required>
                    </div>
                </div>
                <div class="field">
                    <label for="pcoE-desc">Description</label>
                    <input class="input" id="pcoE-desc" name="description" value="${item.description}">
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
                    const all = getPCOs().map(r => r.id === item.id ? { ...r, ...vals } : r);
                    setPCOs(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `${item.number} updated` }));
                }
            }
        }));
        setTimeout(() => window.lucide?.createIcons(), 50);
    }
}
