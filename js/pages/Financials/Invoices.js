import { Card } from "../../components/Card.js";

function getCurrentProjectId() {
    return localStorage.getItem("cm.selectedProject") || "RIV-104";
}

function getKey() {
    return `cmware_invoices_${getCurrentProjectId()}`;
}

const SEED_DATA = [
    { id: "inv-001", number: "INV-2026-001", vendor: "Hardrock Concrete LLC", status: "Paid", amount: 842000, receivedDate: "2026-07-01", description: "July progress payment - Level 03 slab placement" },
    { id: "inv-002", number: "INV-2026-002", vendor: "Structural Supply Co.", status: "PM Review", amount: 520000, receivedDate: "2026-07-15", description: "Steel delivery - Phase 2 shipment" },
    { id: "inv-003", number: "INV-2026-003", vendor: "Exterior Concepts LLC", status: "Received", amount: 380000, receivedDate: "2026-07-20", description: "Metal panel installation - South elevation" }
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
    document.dispatchEvent(new CustomEvent("invoices-changed"));
}

function formatCurrency(val) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
}

const INVOICE_STATUSES = ["Received", "PM Review", "Approved", "Paid", "Disputed"];

export class Invoices {
    constructor() {
        this.searchTerm = "";
        this.currentStatus = "All";
    }

    render() {
        const rows = getData();

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Financial Controls — Phase 4</span>
                    <h1>Invoice Management</h1>
                </div>
                <div class="toolbar">
                    <button class="button primary" id="btn-add-invoice" type="button"><i data-lucide="plus"></i> Add Invoice</button>
                </div>
            </section>

            <div class="form-grid" style="margin-bottom: 1rem; max-width: 600px;">
                <div class="field">
                    <label>Search</label>
                    <div class="input-with-icon"><i data-lucide="search"></i><input class="input" id="inv-search" type="search" placeholder="Filter by number, vendor..."></div>
                </div>
                <div class="field">
                    <label>Status</label>
                    <select class="select" id="inv-status-filter">
                        <option value="All">All Statuses</option>
                        ${INVOICE_STATUSES.map(s => `<option value="${s}">${s}</option>`).join("")}
                    </select>
                </div>
            </div>

            ${Card.render({
                title: "Invoice Register",
                eyebrow: `${rows.length} invoices`,
                body: `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Number</th>
                                    <th>Vendor</th>
                                    <th>Status</th>
                                    <th style="text-align: right;">Amount</th>
                                    <th>Received Date</th>
                                    <th>Description</th>
                                    <th style="text-align: right;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="inv-tbody">
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
                r.vendor.toLowerCase().includes(term)
            );
        }
        if (this.currentStatus !== "All") filtered = filtered.filter(r => r.status === this.currentStatus);

        return filtered.map(r => `
            <tr data-id="${r.id}">
                <td><strong class="text-primary">${r.number}</strong></td>
                <td>${r.vendor}</td>
                <td><span class="badge ${r.status === "Paid" ? "success" : r.status === "Received" ? "neutral" : "warning"}">${r.status}</span></td>
                <td style="text-align: right;">${formatCurrency(r.amount)}</td>
                <td>${r.receivedDate}</td>
                <td>${r.description}</td>
                <td style="text-align: right;">
                    <button class="button small ghost" type="button" data-action="edit-inv" data-id="${r.id}"><i data-lucide="edit-3"></i></button>
                    <button class="button small ghost danger" type="button" data-action="delete-inv" data-id="${r.id}"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `).join("");
    }

    bind() {
        document.getElementById("inv-search")?.addEventListener("input", (e) => {
            this.searchTerm = e.target.value;
            this._refreshTable();
        });

        document.getElementById("inv-status-filter")?.addEventListener("change", (e) => {
            this.currentStatus = e.target.value;
            this._refreshTable();
        });

        document.getElementById("btn-add-invoice")?.addEventListener("click", () => this._openAddModal());

        this._bindActions();
        window.lucide?.createIcons();
    }

    _refreshTable() {
        const tbody = document.getElementById("inv-tbody");
        if (tbody) {
            tbody.innerHTML = this._renderRows(getData());
            this._bindActions();
            window.lucide?.createIcons();
        }
    }

    _bindActions() {
        document.querySelectorAll("[data-action='edit-inv']").forEach(btn => {
            btn.addEventListener("click", () => {
                const item = getData().find(r => r.id === btn.dataset.id);
                if (item) this._openEditModal(item);
            });
        });

        document.querySelectorAll("[data-action='delete-inv']").forEach(btn => {
            btn.addEventListener("click", () => {
                if (confirm(`Delete invoice ${btn.dataset.id}?`)) {
                    const all = getData().filter(r => r.id !== btn.dataset.id);
                    setData(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Invoice deleted" }));
                    this._refreshTable();
                }
            });
        });
    }

    _openAddModal() {
        const body = `
            <form id="form-add-invoice" class="record-form">
                <div class="form-grid">
                    <div class="field">
                        <label for="inv-number">Number *</label>
                        <input class="input" id="inv-number" name="number" required placeholder="e.g. INV-2026-004">
                    </div>
                    <div class="field">
                        <label for="inv-status">Status *</label>
                        <select class="select" id="inv-status" name="status" required>
                            ${INVOICE_STATUSES.map(s => `<option value="${s}">${s}</option>`).join("")}
                        </select>
                    </div>
                </div>
                <div class="field">
                    <label for="inv-vendor">Vendor *</label>
                    <input class="input" id="inv-vendor" name="vendor" required placeholder="e.g. Hardrock Concrete LLC">
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="inv-amount">Amount ($) *</label>
                        <input class="input" id="inv-amount" name="amount" type="number" min="0" required placeholder="0">
                    </div>
                    <div class="field">
                        <label for="inv-date">Received Date *</label>
                        <input class="input" id="inv-date" name="receivedDate" type="date" required>
                    </div>
                </div>
                <div class="field">
                    <label for="inv-desc">Description</label>
                    <input class="input" id="inv-desc" name="description" placeholder="Invoice description">
                </div>
                <div class="split" style="margin-top: 0.75rem;">
                    <span></span>
                    <button class="button primary" type="submit"><i data-lucide="check"></i> Add Invoice</button>
                </div>
            </form>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "Add Invoice",
                body,
                onSubmit: (vals) => {
                    vals.id = "inv-" + Date.now();
                    vals.amount = Number(vals.amount) || 0;
                    const all = getData();
                    all.unshift(vals);
                    setData(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `Invoice ${vals.number} added` }));
                }
            }
        }));

        setTimeout(() => window.lucide?.createIcons(), 50);
    }

    _openEditModal(item) {
        const body = `
            <form id="form-edit-invoice" class="record-form">
                <div class="field">
                    <label>Number</label>
                    <input class="input" value="${item.number}" disabled>
                </div>
                <div class="field">
                    <label for="invE-vendor">Vendor *</label>
                    <input class="input" id="invE-vendor" name="vendor" value="${item.vendor}" required>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="invE-status">Status *</label>
                        <select class="select" id="invE-status" name="status" required>
                            ${INVOICE_STATUSES.map(s => `<option value="${s}"${item.status === s ? " selected" : ""}>${s}</option>`).join("")}
                        </select>
                    </div>
                    <div class="field">
                        <label for="invE-amount">Amount ($) *</label>
                        <input class="input" id="invE-amount" name="amount" type="number" min="0" value="${item.amount}" required>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="invE-date">Received Date *</label>
                        <input class="input" id="invE-date" name="receivedDate" type="date" value="${item.receivedDate}" required>
                    </div>
                    <div class="field">
                        <label for="invE-desc">Description</label>
                        <input class="input" id="invE-desc" name="description" value="${item.description}">
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
