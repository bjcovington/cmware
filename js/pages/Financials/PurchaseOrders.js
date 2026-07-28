import { Card } from "../../components/Card.js";

function getCurrentProjectId() {
    return localStorage.getItem("cm.selectedProject") || "RIV-104";
}

const STATUS_BADGES = {
    "Approved": "success",
    "Sent to Vendor": "info",
    "Draft": "neutral"
};

const SEED_PO = [
    { id: "po-001", number: "PO-001", title: "Steel Stud Framing Materials", vendor: "Structural Supply Co.", status: "Approved", amount: 284000, date: "2026-07-10", description: "Light gauge steel studs and track for Level 02-03 partitions" },
    { id: "po-002", number: "PO-002", title: "Temporary Power Distribution Equipment", vendor: "Volt Electric Inc.", status: "Sent to Vendor", amount: 42500, date: "2026-07-15", description: "400A dist panel and temp feeder cable" },
    { id: "po-003", number: "PO-003", title: "Metal Panel Mock-Up Samples", vendor: "Centria Metal Enclosures", status: "Draft", amount: 8900, date: "2026-07-18", description: "Formawall mock-up for owner approval" }
];

function getKey() {
    return `cmware_purchase_orders_${getCurrentProjectId()}`;
}

function getPOs() {
    const key = getKey();
    const stored = localStorage.getItem(key);
    if (!stored) {
        localStorage.setItem(key, JSON.stringify(SEED_PO));
        return [...SEED_PO];
    }
    try { return JSON.parse(stored); } catch { return [...SEED_PO]; }
}

function setPOs(data) {
    localStorage.setItem(getKey(), JSON.stringify(data));
    document.dispatchEvent(new CustomEvent("purchase-orders-changed"));
}

function fmtCurrency(v) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}

export class PurchaseOrders {
    constructor() {
        this.searchTerm = "";
    }

    render() {
        const rows = this._getFiltered();

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Financial Controls — Phase 2</span>
                    <h1>Purchase Orders</h1>
                    <p>Material and equipment purchase order tracking with vendor status.</p>
                </div>
                <div class="toolbar">
                    <button class="button primary" id="btn-add-po" type="button"><i data-lucide="plus"></i> Add Purchase Order</button>
                </div>
            </section>

            <div class="form-grid" style="margin-bottom: 1rem; max-width: 500px;">
                <div class="field">
                    <label>Search</label>
                    <div class="input-with-icon"><i data-lucide="search"></i><input class="input" id="po-search" type="search" placeholder="Filter by number, title, vendor..."></div>
                </div>
            </div>

            ${Card.render({
                title: "Purchase Orders",
                eyebrow: `${rows.length} orders`,
                body: `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Number</th>
                                    <th>Title</th>
                                    <th>Vendor</th>
                                    <th>Status</th>
                                    <th style="text-align: right;">Amount</th>
                                    <th>Date</th>
                                    <th style="text-align: right;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="po-tbody">
                                ${this._renderRows(rows)}
                            </tbody>
                        </table>
                    </div>
                `
            })}
        `;
    }

    _getFiltered() {
        let data = getPOs();
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
                <td><span class="badge ${STATUS_BADGES[r.status] || "neutral"}">${r.status}</span></td>
                <td style="text-align: right;">${fmtCurrency(r.amount)}</td>
                <td>${r.date}</td>
                <td style="text-align: right;">
                    <button class="button small ghost" type="button" data-action="edit-po" data-id="${r.id}"><i data-lucide="edit-3"></i></button>
                    <button class="button small ghost danger" type="button" data-action="delete-po" data-id="${r.id}"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `).join("");
    }

    bind() {
        document.getElementById("po-search")?.addEventListener("input", (e) => {
            this.searchTerm = e.target.value;
            this._refreshTable();
        });

        document.getElementById("btn-add-po")?.addEventListener("click", () => this._openAddModal());

        this._bindActions();
        window.lucide?.createIcons();
    }

    _refreshTable() {
        const tbody = document.getElementById("po-tbody");
        if (tbody) {
            tbody.innerHTML = this._renderRows(this._getFiltered());
            this._bindActions();
            window.lucide?.createIcons();
        }
    }

    _bindActions() {
        document.querySelectorAll("[data-action='edit-po']").forEach(btn => {
            btn.addEventListener("click", () => {
                const item = getPOs().find(r => r.id === btn.dataset.id);
                if (item) this._openEditModal(item);
            });
        });
        document.querySelectorAll("[data-action='delete-po']").forEach(btn => {
            btn.addEventListener("click", () => {
                if (confirm("Delete this purchase order?")) {
                    setPOs(getPOs().filter(r => r.id !== btn.dataset.id));
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Purchase order deleted" }));
                    this._refreshTable();
                }
            });
        });
    }

    _openAddModal() {
        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "Add Purchase Order",
                body: `
                    <form id="form-add-po" class="record-form">
                        <div class="form-grid">
                            <div class="field">
                                <label for="po-number">PO Number *</label>
                                <input class="input" id="po-number" name="number" required placeholder="e.g. PO-004">
                            </div>
                            <div class="field">
                                <label for="po-title">Title *</label>
                                <input class="input" id="po-title" name="title" required placeholder="e.g. Concrete Admixtures">
                            </div>
                        </div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="po-vendor">Vendor *</label>
                                <input class="input" id="po-vendor" name="vendor" required placeholder="e.g. Master Builders Inc.">
                            </div>
                            <div class="field">
                                <label for="po-status">Status</label>
                                <select class="select" id="po-status" name="status">
                                    <option value="Draft">Draft</option>
                                    <option value="Sent to Vendor">Sent to Vendor</option>
                                    <option value="Approved">Approved</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="po-amount">Amount *</label>
                                <input class="input" id="po-amount" name="amount" type="number" required>
                            </div>
                            <div class="field">
                                <label for="po-date">Date *</label>
                                <input class="input" id="po-date" name="date" type="date" required>
                            </div>
                        </div>
                        <div class="field">
                            <label for="po-desc">Description</label>
                            <input class="input" id="po-desc" name="description" placeholder="Brief description of items ordered">
                        </div>
                        <div class="split" style="margin-top: 0.75rem;">
                            <span></span>
                            <button class="button primary" type="submit"><i data-lucide="check"></i> Add Purchase Order</button>
                        </div>
                    </form>
                `,
                onSubmit: (vals) => {
                    const po = {
                        id: `po-${Date.now()}`,
                        number: vals.number,
                        title: vals.title,
                        vendor: vals.vendor,
                        status: vals.status || "Draft",
                        amount: Number(vals.amount || 0),
                        date: vals.date || new Date().toISOString().split("T")[0],
                        description: vals.description || ""
                    };
                    const all = getPOs();
                    if (all.some(r => r.number === po.number)) {
                        document.dispatchEvent(new CustomEvent("toast", { detail: "PO number already exists" }));
                        return false;
                    }
                    all.push(po);
                    setPOs(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `Purchase order ${po.number} added` }));
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
                    <form id="form-edit-po" class="record-form">
                        <div class="field">
                            <label>PO Number</label>
                            <input class="input" value="${item.number}" disabled>
                        </div>
                        <div class="field">
                            <label for="poE-title">Title *</label>
                            <input class="input" id="poE-title" name="title" value="${item.title}" required>
                        </div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="poE-vendor">Vendor *</label>
                                <input class="input" id="poE-vendor" name="vendor" value="${item.vendor}" required>
                            </div>
                            <div class="field">
                                <label for="poE-status">Status</label>
                                <select class="select" id="poE-status" name="status">
                                    <option value="Draft"${item.status === "Draft" ? " selected" : ""}>Draft</option>
                                    <option value="Sent to Vendor"${item.status === "Sent to Vendor" ? " selected" : ""}>Sent to Vendor</option>
                                    <option value="Approved"${item.status === "Approved" ? " selected" : ""}>Approved</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="poE-amount">Amount *</label>
                                <input class="input" id="poE-amount" name="amount" type="number" value="${item.amount}" required>
                            </div>
                            <div class="field">
                                <label for="poE-date">Date *</label>
                                <input class="input" id="poE-date" name="date" type="date" value="${item.date}" required>
                            </div>
                        </div>
                        <div class="field">
                            <label for="poE-desc">Description</label>
                            <input class="input" id="poE-desc" name="description" value="${item.description}">
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
                        status: vals.status || item.status,
                        amount: Number(vals.amount || item.amount),
                        date: vals.date || item.date,
                        description: vals.description
                    };
                    setPOs(getPOs().map(r => r.id === item.id ? updated : r));
                    document.dispatchEvent(new CustomEvent("toast", { detail: `${item.number} updated` }));
                }
            }
        }));
        setTimeout(() => window.lucide?.createIcons(), 50);
    }
}
