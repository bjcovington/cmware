import { Card } from "../../components/Card.js";

const SEED_COMMITMENTS = [
    { id: "com-001", number: "COM-001", vendor: "Hardrock Concrete LLC", source: "Subcontract", status: "Executed", amount: 8650000, description: "Cast-in-place concrete supply and placement for all levels" },
    { id: "com-002", number: "COM-002", vendor: "Structural Supply Co.", source: "Purchase Order", status: "Executed", amount: 5200000, description: "Structural steel and light gauge framing materials" },
    { id: "com-003", number: "COM-003", vendor: "Volt Electric Inc.", source: "Subcontract", status: "Pending Execution", amount: 6750000, description: "Electrical rough-in, panels, lighting, and fire alarm" }
];

function getCurrentProjectId() {
    return localStorage.getItem("cm.selectedProject") || "RIV-104";
}

function getKey() {
    return `cmware_commitments_${getCurrentProjectId()}`;
}

function getCommitments() {
    const stored = localStorage.getItem(getKey());
    if (!stored) {
        localStorage.setItem(getKey(), JSON.stringify(SEED_COMMITMENTS));
        return [...SEED_COMMITMENTS];
    }
    try { return JSON.parse(stored); } catch { return [...SEED_COMMITMENTS]; }
}

function setCommitments(data) {
    localStorage.setItem(getKey(), JSON.stringify(data));
}

function formatCurrency(val) {
    return "$" + Number(val).toLocaleString("en-US");
}

export class Commitments {
    constructor() {
        this.searchTerm = "";
        this.currentStatus = "All";
    }

    render() {
        const items = getCommitments();
        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Financial Controls — Phase 2</span>
                    <h1>Commitments Register</h1>
                </div>
                <div class="toolbar">
                    <button class="button primary" id="btn-add-commitment" type="button"><i data-lucide="plus"></i> Add Commitment</button>
                </div>
            </section>

            <div class="form-grid" style="margin-bottom: 1rem; max-width: 600px;">
                <div class="field">
                    <label>Search Commitments</label>
                    <div class="input-with-icon"><i data-lucide="search"></i><input class="input" id="commitment-search" type="search" placeholder="Filter by number, vendor, description..."></div>
                </div>
                <div class="field">
                    <label>Status</label>
                    <select class="select" id="commitment-status-filter">
                        <option value="All">All Statuses</option>
                        <option value="Executed">Executed</option>
                        <option value="Pending Execution">Pending Execution</option>
                    </select>
                </div>
            </div>

            ${Card.render({
                title: "Commitments Register",
                eyebrow: `${items.length} commitments`,
                body: `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Number</th>
                                    <th>Vendor</th>
                                    <th>Source</th>
                                    <th>Status</th>
                                    <th style="text-align:right">Amount</th>
                                    <th>Description</th>
                                    <th style="text-align:right">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="commitment-tbody">
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
                r.vendor.toLowerCase().includes(term) ||
                r.description.toLowerCase().includes(term)
            );
        }
        if (this.currentStatus !== "All") filtered = filtered.filter(r => r.status === this.currentStatus);

        return filtered.map(r => `
            <tr data-id="${r.id}">
                <td><strong class="text-primary">${r.number}</strong></td>
                <td>${r.vendor}</td>
                <td><span class="badge neutral">${r.source}</span></td>
                <td><span class="badge ${r.status === "Executed" ? "success" : "warning"}">${r.status}</span></td>
                <td style="text-align:right">${formatCurrency(r.amount)}</td>
                <td>${r.description}</td>
                <td style="text-align:right;">
                    <button class="button small ghost" type="button" data-action="edit-commitment" data-id="${r.id}"><i data-lucide="edit-3"></i></button>
                    <button class="button small ghost danger" type="button" data-action="delete-commitment" data-id="${r.id}"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `).join("");
    }

    bind() {
        document.getElementById("commitment-search")?.addEventListener("input", (e) => {
            this.searchTerm = e.target.value;
            this._refreshTable();
        });

        document.getElementById("commitment-status-filter")?.addEventListener("change", (e) => {
            this.currentStatus = e.target.value;
            this._refreshTable();
        });

        document.getElementById("btn-add-commitment")?.addEventListener("click", () => this._openAddModal());

        this._bindActions();
        window.lucide?.createIcons();
    }

    _refreshTable() {
        const tbody = document.getElementById("commitment-tbody");
        if (tbody) {
            tbody.innerHTML = this._renderRows(getCommitments());
            this._bindActions();
            window.lucide?.createIcons();
        }
    }

    _bindActions() {
        document.querySelectorAll("[data-action='edit-commitment']").forEach(btn => {
            btn.addEventListener("click", () => {
                const item = getCommitments().find(r => r.id === btn.dataset.id);
                if (item) this._openEditModal(item);
            });
        });
        document.querySelectorAll("[data-action='delete-commitment']").forEach(btn => {
            btn.addEventListener("click", () => {
                if (confirm(`Delete commitment ${btn.dataset.id}?`)) {
                    const all = getCommitments().filter(r => r.id !== btn.dataset.id);
                    setCommitments(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Commitment deleted" }));
                    this._refreshTable();
                }
            });
        });
    }

    _openAddModal() {
        const body = `
            <form id="form-add-commitment" class="record-form">
                <div class="form-grid">
                    <div class="field">
                        <label for="cm-number">Number *</label>
                        <input class="input" id="cm-number" name="number" required placeholder="e.g. COM-004">
                    </div>
                    <div class="field">
                        <label for="cm-vendor">Vendor *</label>
                        <input class="input" id="cm-vendor" name="vendor" required placeholder="Vendor name">
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="cm-source">Source *</label>
                        <select class="select" id="cm-source" name="source" required>
                            <option value="Subcontract">Subcontract</option>
                            <option value="Purchase Order">Purchase Order</option>
                            <option value="Service Agreement">Service Agreement</option>
                        </select>
                    </div>
                    <div class="field">
                        <label for="cm-status">Status *</label>
                        <select class="select" id="cm-status" name="status" required>
                            <option value="Executed">Executed</option>
                            <option value="Pending Execution">Pending Execution</option>
                        </select>
                    </div>
                </div>
                <div class="field">
                    <label for="cm-amount">Amount *</label>
                    <input class="input" id="cm-amount" name="amount" type="number" required placeholder="0">
                </div>
                <div class="field">
                    <label for="cm-desc">Description</label>
                    <input class="input" id="cm-desc" name="description" placeholder="Brief description">
                </div>
                <div class="split" style="margin-top: 0.75rem;">
                    <span></span>
                    <button class="button primary" type="submit"><i data-lucide="check"></i> Add Commitment</button>
                </div>
            </form>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "Add Commitment",
                body,
                onSubmit: (vals) => {
                    vals.amount = Number(vals.amount);
                    vals.id = "com-" + Date.now();
                    const all = getCommitments();
                    all.unshift(vals);
                    setCommitments(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Commitment added" }));
                }
            }
        }));
        setTimeout(() => window.lucide?.createIcons(), 50);
    }

    _openEditModal(item) {
        const body = `
            <form id="form-edit-commitment" class="record-form">
                <div class="field">
                    <label>Number</label>
                    <input class="input" value="${item.number}" disabled>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="cmE-vendor">Vendor *</label>
                        <input class="input" id="cmE-vendor" name="vendor" value="${item.vendor}" required>
                    </div>
                    <div class="field">
                        <label for="cmE-source">Source *</label>
                        <select class="select" id="cmE-source" name="source" required>
                            <option value="Subcontract"${item.source === "Subcontract" ? " selected" : ""}>Subcontract</option>
                            <option value="Purchase Order"${item.source === "Purchase Order" ? " selected" : ""}>Purchase Order</option>
                            <option value="Service Agreement"${item.source === "Service Agreement" ? " selected" : ""}>Service Agreement</option>
                        </select>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="cmE-status">Status *</label>
                        <select class="select" id="cmE-status" name="status" required>
                            <option value="Executed"${item.status === "Executed" ? " selected" : ""}>Executed</option>
                            <option value="Pending Execution"${item.status === "Pending Execution" ? " selected" : ""}>Pending Execution</option>
                        </select>
                    </div>
                    <div class="field">
                        <label for="cmE-amount">Amount *</label>
                        <input class="input" id="cmE-amount" name="amount" type="number" value="${item.amount}" required>
                    </div>
                </div>
                <div class="field">
                    <label for="cmE-desc">Description</label>
                    <input class="input" id="cmE-desc" name="description" value="${item.description}">
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
                    const all = getCommitments().map(r => r.id === item.id ? { ...r, ...vals } : r);
                    setCommitments(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `${item.number} updated` }));
                }
            }
        }));
        setTimeout(() => window.lucide?.createIcons(), 50);
    }
}
