import { Card } from "../../components/Card.js";

function getCurrentProjectId() {
    return localStorage.getItem("cm.selectedProject") || "RIV-104";
}

const STATUS_BADGES = {
    "Executed": "success",
    "Pending Execution": "warning",
    "Draft": "neutral",
    "Terminated": "danger"
};

const SEED_CONTRACTS = [
    { id: "ctr-001", number: "OC-001", title: "Owner Construction Agreement", vendor: "Riverside Health Trust", status: "Executed", value: 48250000, type: "Owner Contract" },
    { id: "ctr-002", number: "DC-001", title: "Design Services Agreement", vendor: "Design Studio International", status: "Executed", value: 3860000, type: "Design Contract" },
    { id: "ctr-003", number: "SC-010", title: "Structural Steel Subcontract", vendor: "Hardrock Concrete LLC", status: "Pending Execution", value: 5400000, type: "Subcontract" }
];

function getKey() {
    return `cmware_contracts_${getCurrentProjectId()}`;
}

function getContracts() {
    const key = getKey();
    const stored = localStorage.getItem(key);
    if (!stored) {
        localStorage.setItem(key, JSON.stringify(SEED_CONTRACTS));
        return [...SEED_CONTRACTS];
    }
    try { return JSON.parse(stored); } catch { return [...SEED_CONTRACTS]; }
}

function setContracts(data) {
    localStorage.setItem(getKey(), JSON.stringify(data));
    document.dispatchEvent(new CustomEvent("contracts-changed"));
}

function fmtCurrency(v) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}

export class Contracts {
    constructor() {
        this.searchTerm = "";
    }

    render() {
        const rows = this._getFiltered();

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Financial Controls — Phase 1</span>
                    <h1>Contract Values</h1>
                    <p>Owner contracts, design agreements, and subcontracts with execution status.</p>
                </div>
                <div class="toolbar">
                    <button class="button primary" id="btn-add-contract" type="button"><i data-lucide="plus"></i> Add Contract</button>
                </div>
            </section>

            <div class="form-grid" style="margin-bottom: 1rem; max-width: 500px;">
                <div class="field">
                    <label>Search</label>
                    <div class="input-with-icon"><i data-lucide="search"></i><input class="input" id="contract-search" type="search" placeholder="Filter by number, title, vendor..."></div>
                </div>
            </div>

            ${Card.render({
                title: "Contract Register",
                eyebrow: `${rows.length} contracts`,
                body: `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Number</th>
                                    <th>Title</th>
                                    <th>Vendor</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th style="text-align: right;">Value</th>
                                    <th style="text-align: right;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="contract-tbody">
                                ${this._renderRows(rows)}
                            </tbody>
                        </table>
                    </div>
                `
            })}
        `;
    }

    _getFiltered() {
        let data = getContracts();
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            data = data.filter(r => r.number.toLowerCase().includes(term) || r.title.toLowerCase().includes(term) || r.vendor.toLowerCase().includes(term));
        }
        return data;
    }

    _renderRows(rows) {
        return rows.map(r => `
            <tr>
                <td><strong class="text-primary">${r.number}</strong></td>
                <td>${r.title}</td>
                <td>${r.vendor}</td>
                <td><span class="badge neutral">${r.type}</span></td>
                <td><span class="badge ${STATUS_BADGES[r.status] || "neutral"}">${r.status}</span></td>
                <td style="text-align: right;">${fmtCurrency(r.value)}</td>
                <td style="text-align: right;">
                    <button class="button small ghost" type="button" data-action="edit-contract" data-id="${r.id}"><i data-lucide="edit-3"></i></button>
                    <button class="button small ghost danger" type="button" data-action="delete-contract" data-id="${r.id}"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `).join("");
    }

    bind() {
        document.getElementById("contract-search")?.addEventListener("input", (e) => {
            this.searchTerm = e.target.value;
            this._refreshTable();
        });

        document.getElementById("btn-add-contract")?.addEventListener("click", () => this._openAddModal());

        this._bindActions();
        window.lucide?.createIcons();
    }

    _refreshTable() {
        const tbody = document.getElementById("contract-tbody");
        if (tbody) {
            tbody.innerHTML = this._renderRows(this._getFiltered());
            this._bindActions();
            window.lucide?.createIcons();
        }
    }

    _bindActions() {
        document.querySelectorAll("[data-action='edit-contract']").forEach(btn => {
            btn.addEventListener("click", () => {
                const item = getContracts().find(r => r.id === btn.dataset.id);
                if (item) this._openEditModal(item);
            });
        });
        document.querySelectorAll("[data-action='delete-contract']").forEach(btn => {
            btn.addEventListener("click", () => {
                if (confirm("Delete this contract?")) {
                    setContracts(getContracts().filter(r => r.id !== btn.dataset.id));
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Contract deleted" }));
                    this._refreshTable();
                }
            });
        });
    }

    _openAddModal() {
        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "Add Contract",
                body: `
                    <form id="form-add-contract" class="record-form">
                        <div class="form-grid">
                            <div class="field">
                                <label for="ct-number">Contract Number *</label>
                                <input class="input" id="ct-number" name="number" required placeholder="e.g. SC-020">
                            </div>
                            <div class="field">
                                <label for="ct-title">Title *</label>
                                <input class="input" id="ct-title" name="title" required placeholder="e.g. Mechanical Subcontract">
                            </div>
                        </div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="ct-vendor">Vendor *</label>
                                <input class="input" id="ct-vendor" name="vendor" required placeholder="e.g. Apex MEP Consulting">
                            </div>
                            <div class="field">
                                <label for="ct-type">Type *</label>
                                <select class="select" id="ct-type" name="type" required>
                                    <option value="Owner Contract">Owner Contract</option>
                                    <option value="Subcontract">Subcontract</option>
                                    <option value="Design Contract">Design Contract</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="ct-value">Value *</label>
                                <input class="input" id="ct-value" name="value" type="number" required>
                            </div>
                            <div class="field">
                                <label for="ct-status">Status</label>
                                <select class="select" id="ct-status" name="status">
                                    <option value="Draft">Draft</option>
                                    <option value="Pending Execution">Pending Execution</option>
                                    <option value="Executed">Executed</option>
                                </select>
                            </div>
                        </div>
                        <div class="split" style="margin-top: 0.75rem;">
                            <span></span>
                            <button class="button primary" type="submit"><i data-lucide="check"></i> Add Contract</button>
                        </div>
                    </form>
                `,
                onSubmit: (vals) => {
                    const contract = {
                        id: `ctr-${Date.now()}`,
                        number: vals.number,
                        title: vals.title,
                        vendor: vals.vendor,
                        status: vals.status || "Draft",
                        value: Number(vals.value || 0),
                        type: vals.type
                    };
                    const all = getContracts();
                    if (all.some(r => r.number === contract.number)) {
                        document.dispatchEvent(new CustomEvent("toast", { detail: "Contract number already exists" }));
                        return false;
                    }
                    all.push(contract);
                    setContracts(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `Contract ${contract.number} added` }));
                }
            }
        }));
        setTimeout(() => window.lucide?.createIcons(), 50);
    }

    _openEditModal(item) {
        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: `Edit ${item.number} — ${item.title}`,
                body: `
                    <form id="form-edit-contract" class="record-form">
                        <div class="field">
                            <label>Contract Number</label>
                            <input class="input" value="${item.number}" disabled>
                        </div>
                        <div class="field">
                            <label for="ctE-title">Title *</label>
                            <input class="input" id="ctE-title" name="title" value="${item.title}" required>
                        </div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="ctE-vendor">Vendor *</label>
                                <input class="input" id="ctE-vendor" name="vendor" value="${item.vendor}" required>
                            </div>
                            <div class="field">
                                <label for="ctE-type">Type *</label>
                                <select class="select" id="ctE-type" name="type" required>
                                    <option value="Owner Contract"${item.type === "Owner Contract" ? " selected" : ""}>Owner Contract</option>
                                    <option value="Subcontract"${item.type === "Subcontract" ? " selected" : ""}>Subcontract</option>
                                    <option value="Design Contract"${item.type === "Design Contract" ? " selected" : ""}>Design Contract</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="ctE-value">Value *</label>
                                <input class="input" id="ctE-value" name="value" type="number" value="${item.value}" required>
                            </div>
                            <div class="field">
                                <label for="ctE-status">Status</label>
                                <select class="select" id="ctE-status" name="status">
                                    <option value="Draft"${item.status === "Draft" ? " selected" : ""}>Draft</option>
                                    <option value="Pending Execution"${item.status === "Pending Execution" ? " selected" : ""}>Pending Execution</option>
                                    <option value="Executed"${item.status === "Executed" ? " selected" : ""}>Executed</option>
                                </select>
                            </div>
                        </div>
                        <div class="split" style="margin-top: 0.75rem;">
                            <span></span>
                            <button class="button primary" type="submit"><i data-lucide="save"></i> Save Changes</button>
                        </div>
                    </form>
                `,
                onSubmit: (vals) => {
                    const updated = {
                        ...item,
                        title: vals.title,
                        vendor: vals.vendor,
                        type: vals.type,
                        value: Number(vals.value || item.value),
                        status: vals.status || item.status
                    };
                    setContracts(getContracts().map(r => r.id === item.id ? updated : r));
                    document.dispatchEvent(new CustomEvent("toast", { detail: `${item.number} updated` }));
                }
            }
        }));
        setTimeout(() => window.lucide?.createIcons(), 50);
    }
}
