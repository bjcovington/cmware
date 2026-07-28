import { Card } from "../../components/Card.js";

function getCurrentProjectId() {
    return localStorage.getItem("cm.selectedProject") || "RIV-104";
}

function getKey() {
    return `cmware_pay_apps_${getCurrentProjectId()}`;
}

const SEED_DATA = [
    { id: "pay-001", number: "PA-001", period: "July 2026", status: "Approved", amount: 2450000, submittedDate: "2026-07-25", retainage: 245000 },
    { id: "pay-002", number: "PA-002", period: "August 2026", status: "Draft", amount: 0, submittedDate: "", retainage: 0 }
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
    document.dispatchEvent(new CustomEvent("pay-apps-changed"));
}

function formatCurrency(val) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
}

const PAY_APP_STATUSES = ["Draft", "Submitted", "Approved", "Rejected"];

export class PayApplications {
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
                    <h1>Pay Applications</h1>
                </div>
                <div class="toolbar">
                    <button class="button primary" id="btn-add-payapp" type="button"><i data-lucide="plus"></i> Add Pay Application</button>
                </div>
            </section>

            <div class="form-grid" style="margin-bottom: 1rem; max-width: 600px;">
                <div class="field">
                    <label>Search</label>
                    <div class="input-with-icon"><i data-lucide="search"></i><input class="input" id="pay-search" type="search" placeholder="Filter by number, period..."></div>
                </div>
                <div class="field">
                    <label>Status</label>
                    <select class="select" id="pay-status-filter">
                        <option value="All">All Statuses</option>
                        ${PAY_APP_STATUSES.map(s => `<option value="${s}">${s}</option>`).join("")}
                    </select>
                </div>
            </div>

            ${Card.render({
                title: "Pay Application Register",
                eyebrow: `${rows.length} applications`,
                body: `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Number</th>
                                    <th>Period</th>
                                    <th>Status</th>
                                    <th style="text-align: right;">Amount</th>
                                    <th>Submitted Date</th>
                                    <th style="text-align: right;">Retainage</th>
                                    <th style="text-align: right;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="pay-tbody">
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
                r.period.toLowerCase().includes(term)
            );
        }
        if (this.currentStatus !== "All") filtered = filtered.filter(r => r.status === this.currentStatus);

        return filtered.map(r => `
            <tr data-id="${r.id}">
                <td><strong class="text-primary">${r.number}</strong></td>
                <td>${r.period}</td>
                <td><span class="badge ${r.status === "Approved" ? "success" : r.status === "Draft" ? "neutral" : "warning"}">${r.status}</span></td>
                <td style="text-align: right;">${formatCurrency(r.amount)}</td>
                <td>${r.submittedDate || "—"}</td>
                <td style="text-align: right;">${formatCurrency(r.retainage)}</td>
                <td style="text-align: right;">
                    <button class="button small ghost" type="button" data-action="edit-pay" data-id="${r.id}"><i data-lucide="edit-3"></i></button>
                    <button class="button small ghost danger" type="button" data-action="delete-pay" data-id="${r.id}"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `).join("");
    }

    bind() {
        document.getElementById("pay-search")?.addEventListener("input", (e) => {
            this.searchTerm = e.target.value;
            this._refreshTable();
        });

        document.getElementById("pay-status-filter")?.addEventListener("change", (e) => {
            this.currentStatus = e.target.value;
            this._refreshTable();
        });

        document.getElementById("btn-add-payapp")?.addEventListener("click", () => this._openAddModal());

        this._bindActions();
        window.lucide?.createIcons();
    }

    _refreshTable() {
        const tbody = document.getElementById("pay-tbody");
        if (tbody) {
            tbody.innerHTML = this._renderRows(getData());
            this._bindActions();
            window.lucide?.createIcons();
        }
    }

    _bindActions() {
        document.querySelectorAll("[data-action='edit-pay']").forEach(btn => {
            btn.addEventListener("click", () => {
                const item = getData().find(r => r.id === btn.dataset.id);
                if (item) this._openEditModal(item);
            });
        });

        document.querySelectorAll("[data-action='delete-pay']").forEach(btn => {
            btn.addEventListener("click", () => {
                if (confirm(`Delete pay application ${btn.dataset.id}?`)) {
                    const all = getData().filter(r => r.id !== btn.dataset.id);
                    setData(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Pay application deleted" }));
                    this._refreshTable();
                }
            });
        });
    }

    _openAddModal() {
        const body = `
            <form id="form-add-payapp" class="record-form">
                <div class="form-grid">
                    <div class="field">
                        <label for="pay-number">Number *</label>
                        <input class="input" id="pay-number" name="number" required placeholder="e.g. PA-003">
                    </div>
                    <div class="field">
                        <label for="pay-period">Period *</label>
                        <input class="input" id="pay-period" name="period" required placeholder="e.g. September 2026">
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="pay-status">Status *</label>
                        <select class="select" id="pay-status" name="status" required>
                            ${PAY_APP_STATUSES.map(s => `<option value="${s}">${s}</option>`).join("")}
                        </select>
                    </div>
                    <div class="field">
                        <label for="pay-amount">Amount ($) *</label>
                        <input class="input" id="pay-amount" name="amount" type="number" min="0" required placeholder="0">
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="pay-date">Submitted Date</label>
                        <input class="input" id="pay-date" name="submittedDate" type="date">
                    </div>
                    <div class="field">
                        <label for="pay-retainage">Retainage ($)</label>
                        <input class="input" id="pay-retainage" name="retainage" type="number" min="0" placeholder="0">
                    </div>
                </div>
                <div class="split" style="margin-top: 0.75rem;">
                    <span></span>
                    <button class="button primary" type="submit"><i data-lucide="check"></i> Add Pay Application</button>
                </div>
            </form>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "Add Pay Application",
                body,
                onSubmit: (vals) => {
                    vals.id = "pay-" + Date.now();
                    vals.amount = Number(vals.amount) || 0;
                    vals.retainage = Number(vals.retainage) || 0;
                    const all = getData();
                    all.unshift(vals);
                    setData(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `Pay application ${vals.number} added` }));
                }
            }
        }));

        setTimeout(() => window.lucide?.createIcons(), 50);
    }

    _openEditModal(item) {
        const body = `
            <form id="form-edit-payapp" class="record-form">
                <div class="field">
                    <label>Number</label>
                    <input class="input" value="${item.number}" disabled>
                </div>
                <div class="field">
                    <label for="payE-period">Period *</label>
                    <input class="input" id="payE-period" name="period" value="${item.period}" required>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="payE-status">Status *</label>
                        <select class="select" id="payE-status" name="status" required>
                            ${PAY_APP_STATUSES.map(s => `<option value="${s}"${item.status === s ? " selected" : ""}>${s}</option>`).join("")}
                        </select>
                    </div>
                    <div class="field">
                        <label for="payE-amount">Amount ($) *</label>
                        <input class="input" id="payE-amount" name="amount" type="number" min="0" value="${item.amount}" required>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="payE-date">Submitted Date</label>
                        <input class="input" id="payE-date" name="submittedDate" type="date" value="${item.submittedDate}">
                    </div>
                    <div class="field">
                        <label for="payE-retainage">Retainage ($)</label>
                        <input class="input" id="payE-retainage" name="retainage" type="number" min="0" value="${item.retainage}">
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
                    vals.retainage = Number(vals.retainage) || 0;
                    const all = getData().map(r => r.id === item.id ? { ...r, ...vals } : r);
                    setData(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `${item.number} updated` }));
                }
            }
        }));

        setTimeout(() => window.lucide?.createIcons(), 50);
    }
}
