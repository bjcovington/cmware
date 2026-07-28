import { Card } from "../../components/Card.js";

const SEED_SUBCONTRACTS = [
    { id: "sc-001", number: "S-001", subcontractor: "Hardrock Concrete LLC", trade: "Concrete", status: "Executed", originalAmount: 8200000, changeOrders: 450000, revisedAmount: 8650000 },
    { id: "sc-002", number: "S-002", subcontractor: "Exterior Concepts LLC", trade: "Envelope & Panels", status: "Executed", originalAmount: 4000000, changeOrders: 200000, revisedAmount: 4200000 },
    { id: "sc-003", number: "S-003", subcontractor: "Volt Electric Inc.", trade: "Electrical", status: "Draft", originalAmount: 6500000, changeOrders: 0, revisedAmount: 6500000 }
];

function getCurrentProjectId() {
    return localStorage.getItem("cm.selectedProject") || "RIV-104";
}

function getKey() {
    return `cmware_subcontracts_${getCurrentProjectId()}`;
}

function getSubcontracts() {
    const stored = localStorage.getItem(getKey());
    if (!stored) {
        localStorage.setItem(getKey(), JSON.stringify(SEED_SUBCONTRACTS));
        return [...SEED_SUBCONTRACTS];
    }
    try { return JSON.parse(stored); } catch { return [...SEED_SUBCONTRACTS]; }
}

function setSubcontracts(data) {
    localStorage.setItem(getKey(), JSON.stringify(data));
}

function formatCurrency(val) {
    return "$" + Number(val).toLocaleString("en-US");
}

export class Subcontracts {
    constructor() {
        this.searchTerm = "";
        this.currentStatus = "All";
    }

    render() {
        const items = getSubcontracts();
        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Financial Controls — Phase 2</span>
                    <h1>Subcontracts (S-Codes)</h1>
                </div>
                <div class="toolbar">
                    <button class="button primary" id="btn-add-subcontract" type="button"><i data-lucide="plus"></i> Add Subcontract</button>
                </div>
            </section>

            <div class="form-grid" style="margin-bottom: 1rem; max-width: 600px;">
                <div class="field">
                    <label>Search Subcontracts</label>
                    <div class="input-with-icon"><i data-lucide="search"></i><input class="input" id="subcontract-search" type="search" placeholder="Filter by number, subcontractor, trade..."></div>
                </div>
                <div class="field">
                    <label>Status</label>
                    <select class="select" id="subcontract-status-filter">
                        <option value="All">All Statuses</option>
                        <option value="Executed">Executed</option>
                        <option value="Draft">Draft</option>
                    </select>
                </div>
            </div>

            ${Card.render({
                title: "Subcontracts (S-Codes)",
                eyebrow: `${items.length} subcontracts`,
                body: `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Number</th>
                                    <th>Subcontractor</th>
                                    <th>Trade</th>
                                    <th>Status</th>
                                    <th style="text-align:right">Original Amount</th>
                                    <th style="text-align:right">Change Orders</th>
                                    <th style="text-align:right">Revised Amount</th>
                                    <th style="text-align:right">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="subcontract-tbody">
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
                r.subcontractor.toLowerCase().includes(term) ||
                r.trade.toLowerCase().includes(term)
            );
        }
        if (this.currentStatus !== "All") filtered = filtered.filter(r => r.status === this.currentStatus);

        return filtered.map(r => `
            <tr data-id="${r.id}">
                <td><strong class="text-primary">${r.number}</strong></td>
                <td>${r.subcontractor}</td>
                <td><span class="badge neutral">${r.trade}</span></td>
                <td><span class="badge ${r.status === "Executed" ? "success" : "neutral"}">${r.status}</span></td>
                <td style="text-align:right">${formatCurrency(r.originalAmount)}</td>
                <td style="text-align:right">${formatCurrency(r.changeOrders)}</td>
                <td style="text-align:right"><strong>${formatCurrency(r.revisedAmount)}</strong></td>
                <td style="text-align:right;">
                    <button class="button small ghost" type="button" data-action="edit-subcontract" data-id="${r.id}"><i data-lucide="edit-3"></i></button>
                    <button class="button small ghost danger" type="button" data-action="delete-subcontract" data-id="${r.id}"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `).join("");
    }

    bind() {
        document.getElementById("subcontract-search")?.addEventListener("input", (e) => {
            this.searchTerm = e.target.value;
            this._refreshTable();
        });

        document.getElementById("subcontract-status-filter")?.addEventListener("change", (e) => {
            this.currentStatus = e.target.value;
            this._refreshTable();
        });

        document.getElementById("btn-add-subcontract")?.addEventListener("click", () => this._openAddModal());

        this._bindActions();
        window.lucide?.createIcons();
    }

    _refreshTable() {
        const tbody = document.getElementById("subcontract-tbody");
        if (tbody) {
            tbody.innerHTML = this._renderRows(getSubcontracts());
            this._bindActions();
            window.lucide?.createIcons();
        }
    }

    _bindActions() {
        document.querySelectorAll("[data-action='edit-subcontract']").forEach(btn => {
            btn.addEventListener("click", () => {
                const item = getSubcontracts().find(r => r.id === btn.dataset.id);
                if (item) this._openEditModal(item);
            });
        });
        document.querySelectorAll("[data-action='delete-subcontract']").forEach(btn => {
            btn.addEventListener("click", () => {
                if (confirm(`Delete subcontract ${btn.dataset.id}?`)) {
                    const all = getSubcontracts().filter(r => r.id !== btn.dataset.id);
                    setSubcontracts(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Subcontract deleted" }));
                    this._refreshTable();
                }
            });
        });
    }

    _openAddModal() {
        const body = `
            <form id="form-add-subcontract" class="record-form">
                <div class="form-grid">
                    <div class="field">
                        <label for="sc-number">Number *</label>
                        <input class="input" id="sc-number" name="number" required placeholder="e.g. S-004">
                    </div>
                    <div class="field">
                        <label for="sc-sub">Subcontractor *</label>
                        <input class="input" id="sc-sub" name="subcontractor" required placeholder="Subcontractor name">
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="sc-trade">Trade *</label>
                        <input class="input" id="sc-trade" name="trade" required placeholder="e.g. Mechanical">
                    </div>
                    <div class="field">
                        <label for="sc-status">Status *</label>
                        <select class="select" id="sc-status" name="status" required>
                            <option value="Draft">Draft</option>
                            <option value="Executed">Executed</option>
                        </select>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="sc-original">Original Amount *</label>
                        <input class="input" id="sc-original" name="originalAmount" type="number" required placeholder="0">
                    </div>
                    <div class="field">
                        <label for="sc-co">Change Orders</label>
                        <input class="input" id="sc-co" name="changeOrders" type="number" value="0" placeholder="0">
                    </div>
                </div>
                <div class="split" style="margin-top: 0.75rem;">
                    <span></span>
                    <button class="button primary" type="submit"><i data-lucide="check"></i> Add Subcontract</button>
                </div>
            </form>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "Add Subcontract",
                body,
                onSubmit: (vals) => {
                    vals.originalAmount = Number(vals.originalAmount);
                    vals.changeOrders = Number(vals.changeOrders);
                    vals.revisedAmount = vals.originalAmount + vals.changeOrders;
                    vals.id = "sc-" + Date.now();
                    const all = getSubcontracts();
                    all.unshift(vals);
                    setSubcontracts(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Subcontract added" }));
                }
            }
        }));
        setTimeout(() => window.lucide?.createIcons(), 50);
    }

    _openEditModal(item) {
        const body = `
            <form id="form-edit-subcontract" class="record-form">
                <div class="field">
                    <label>Number</label>
                    <input class="input" value="${item.number}" disabled>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="scE-sub">Subcontractor *</label>
                        <input class="input" id="scE-sub" name="subcontractor" value="${item.subcontractor}" required>
                    </div>
                    <div class="field">
                        <label for="scE-trade">Trade *</label>
                        <input class="input" id="scE-trade" name="trade" value="${item.trade}" required>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="scE-status">Status *</label>
                        <select class="select" id="scE-status" name="status" required>
                            <option value="Draft"${item.status === "Draft" ? " selected" : ""}>Draft</option>
                            <option value="Executed"${item.status === "Executed" ? " selected" : ""}>Executed</option>
                        </select>
                    </div>
                    <div class="field">
                        <label for="scE-original">Original Amount *</label>
                        <input class="input" id="scE-original" name="originalAmount" type="number" value="${item.originalAmount}" required>
                    </div>
                </div>
                <div class="field">
                    <label for="scE-co">Change Orders</label>
                    <input class="input" id="scE-co" name="changeOrders" type="number" value="${item.changeOrders}">
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
                    vals.originalAmount = Number(vals.originalAmount);
                    vals.changeOrders = Number(vals.changeOrders);
                    vals.revisedAmount = vals.originalAmount + vals.changeOrders;
                    const all = getSubcontracts().map(r => r.id === item.id ? { ...r, ...vals } : r);
                    setSubcontracts(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `${item.number} updated` }));
                }
            }
        }));
        setTimeout(() => window.lucide?.createIcons(), 50);
    }
}
