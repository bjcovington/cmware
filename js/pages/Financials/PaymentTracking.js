import { Card } from "../../components/Card.js";

function getCurrentProjectId() {
    return localStorage.getItem("cm.selectedProject") || "RIV-104";
}

function getKey() {
    return `cmware_payments_${getCurrentProjectId()}`;
}

const SEED_DATA = [
    { id: "pmt-001", number: "PMT-001", payee: "Hardrock Concrete LLC", status: "Cleared", amount: 842000, method: "ACH", date: "2026-07-28", reference: "ACH-20260728-HC" },
    { id: "pmt-002", number: "PMT-002", payee: "Structural Supply Co.", status: "Processing", amount: 520000, method: "Check", date: "2026-08-01", reference: "CHK-4521" }
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
    document.dispatchEvent(new CustomEvent("payments-changed"));
}

function formatCurrency(val) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
}

const PAYMENT_STATUSES = ["Pending", "Processing", "Cleared", "Void"];
const PAYMENT_METHODS = ["ACH", "Check", "Wire", "Credit Card"];

export class PaymentTracking {
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
                    <h1>Payment Tracking</h1>
                </div>
                <div class="toolbar">
                    <button class="button primary" id="btn-add-payment" type="button"><i data-lucide="plus"></i> Record Payment</button>
                </div>
            </section>

            <div class="form-grid" style="margin-bottom: 1rem; max-width: 600px;">
                <div class="field">
                    <label>Search</label>
                    <div class="input-with-icon"><i data-lucide="search"></i><input class="input" id="pmt-search" type="search" placeholder="Filter by number, payee, reference..."></div>
                </div>
                <div class="field">
                    <label>Status</label>
                    <select class="select" id="pmt-status-filter">
                        <option value="All">All Statuses</option>
                        ${PAYMENT_STATUSES.map(s => `<option value="${s}">${s}</option>`).join("")}
                    </select>
                </div>
            </div>

            ${Card.render({
                title: "Payment Register",
                eyebrow: `${rows.length} payments`,
                body: `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Number</th>
                                    <th>Payee</th>
                                    <th>Status</th>
                                    <th style="text-align: right;">Amount</th>
                                    <th>Method</th>
                                    <th>Date</th>
                                    <th>Reference</th>
                                    <th style="text-align: right;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="pmt-tbody">
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
                r.payee.toLowerCase().includes(term) ||
                r.reference.toLowerCase().includes(term)
            );
        }
        if (this.currentStatus !== "All") filtered = filtered.filter(r => r.status === this.currentStatus);

        return filtered.map(r => `
            <tr data-id="${r.id}">
                <td><strong class="text-primary">${r.number}</strong></td>
                <td>${r.payee}</td>
                <td><span class="badge ${r.status === "Cleared" ? "success" : r.status === "Void" ? "danger" : "warning"}">${r.status}</span></td>
                <td style="text-align: right;">${formatCurrency(r.amount)}</td>
                <td><span class="badge neutral">${r.method}</span></td>
                <td>${r.date}</td>
                <td>${r.reference}</td>
                <td style="text-align: right;">
                    <button class="button small ghost" type="button" data-action="edit-pmt" data-id="${r.id}"><i data-lucide="edit-3"></i></button>
                    <button class="button small ghost danger" type="button" data-action="delete-pmt" data-id="${r.id}"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `).join("");
    }

    bind() {
        document.getElementById("pmt-search")?.addEventListener("input", (e) => {
            this.searchTerm = e.target.value;
            this._refreshTable();
        });

        document.getElementById("pmt-status-filter")?.addEventListener("change", (e) => {
            this.currentStatus = e.target.value;
            this._refreshTable();
        });

        document.getElementById("btn-add-payment")?.addEventListener("click", () => this._openAddModal());

        this._bindActions();
        window.lucide?.createIcons();
    }

    _refreshTable() {
        const tbody = document.getElementById("pmt-tbody");
        if (tbody) {
            tbody.innerHTML = this._renderRows(getData());
            this._bindActions();
            window.lucide?.createIcons();
        }
    }

    _bindActions() {
        document.querySelectorAll("[data-action='edit-pmt']").forEach(btn => {
            btn.addEventListener("click", () => {
                const item = getData().find(r => r.id === btn.dataset.id);
                if (item) this._openEditModal(item);
            });
        });

        document.querySelectorAll("[data-action='delete-pmt']").forEach(btn => {
            btn.addEventListener("click", () => {
                if (confirm(`Delete payment ${btn.dataset.id}?`)) {
                    const all = getData().filter(r => r.id !== btn.dataset.id);
                    setData(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Payment deleted" }));
                    this._refreshTable();
                }
            });
        });
    }

    _openAddModal() {
        const body = `
            <form id="form-add-payment" class="record-form">
                <div class="form-grid">
                    <div class="field">
                        <label for="pmt-number">Number *</label>
                        <input class="input" id="pmt-number" name="number" required placeholder="e.g. PMT-003">
                    </div>
                    <div class="field">
                        <label for="pmt-status">Status *</label>
                        <select class="select" id="pmt-status" name="status" required>
                            ${PAYMENT_STATUSES.map(s => `<option value="${s}">${s}</option>`).join("")}
                        </select>
                    </div>
                </div>
                <div class="field">
                    <label for="pmt-payee">Payee *</label>
                    <input class="input" id="pmt-payee" name="payee" required placeholder="e.g. Hardrock Concrete LLC">
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="pmt-amount">Amount ($) *</label>
                        <input class="input" id="pmt-amount" name="amount" type="number" min="0" required placeholder="0">
                    </div>
                    <div class="field">
                        <label for="pmt-method">Method *</label>
                        <select class="select" id="pmt-method" name="method" required>
                            ${PAYMENT_METHODS.map(m => `<option value="${m}">${m}</option>`).join("")}
                        </select>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="pmt-date">Date *</label>
                        <input class="input" id="pmt-date" name="date" type="date" required>
                    </div>
                    <div class="field">
                        <label for="pmt-ref">Reference *</label>
                        <input class="input" id="pmt-ref" name="reference" required placeholder="e.g. ACH-20260801-HC">
                    </div>
                </div>
                <div class="split" style="margin-top: 0.75rem;">
                    <span></span>
                    <button class="button primary" type="submit"><i data-lucide="check"></i> Record Payment</button>
                </div>
            </form>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "Record Payment",
                body,
                onSubmit: (vals) => {
                    vals.id = "pmt-" + Date.now();
                    vals.amount = Number(vals.amount) || 0;
                    const all = getData();
                    all.unshift(vals);
                    setData(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `Payment ${vals.number} recorded` }));
                }
            }
        }));

        setTimeout(() => window.lucide?.createIcons(), 50);
    }

    _openEditModal(item) {
        const body = `
            <form id="form-edit-payment" class="record-form">
                <div class="field">
                    <label>Number</label>
                    <input class="input" value="${item.number}" disabled>
                </div>
                <div class="field">
                    <label for="pmtE-payee">Payee *</label>
                    <input class="input" id="pmtE-payee" name="payee" value="${item.payee}" required>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="pmtE-status">Status *</label>
                        <select class="select" id="pmtE-status" name="status" required>
                            ${PAYMENT_STATUSES.map(s => `<option value="${s}"${item.status === s ? " selected" : ""}>${s}</option>`).join("")}
                        </select>
                    </div>
                    <div class="field">
                        <label for="pmtE-amount">Amount ($) *</label>
                        <input class="input" id="pmtE-amount" name="amount" type="number" min="0" value="${item.amount}" required>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="pmtE-method">Method *</label>
                        <select class="select" id="pmtE-method" name="method" required>
                            ${PAYMENT_METHODS.map(m => `<option value="${m}"${item.method === m ? " selected" : ""}>${m}</option>`).join("")}
                        </select>
                    </div>
                    <div class="field">
                        <label for="pmtE-date">Date *</label>
                        <input class="input" id="pmtE-date" name="date" type="date" value="${item.date}" required>
                    </div>
                </div>
                <div class="field">
                    <label for="pmtE-ref">Reference *</label>
                    <input class="input" id="pmtE-ref" name="reference" value="${item.reference}" required>
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
