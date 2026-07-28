import { Card } from "../../components/Card.js";

function getCurrentProjectId() {
    return localStorage.getItem("cm.selectedProject") || "RIV-104";
}

const STATUS_BADGES = {
    "Awarded": "success",
    "Pending": "warning",
    "Rejected": "danger"
};

const SEED_BUYOUT = [
    { id: "buy-001", number: "BID-001", trade: "Structural Steel", vendor: "Structural Supply Co.", status: "Awarded", bidAmount: 5200000, scheduledValue: 5400000, notes: "Awarded - mobilization starts Aug 1" },
    { id: "buy-002", number: "BID-002", trade: "Electrical Distribution", vendor: "Volt Electric Inc.", status: "Pending", bidAmount: 6650000, scheduledValue: 6800000, notes: "2 bids received, under PM review" },
    { id: "buy-003", number: "BID-003", trade: "HVAC Mechanical", vendor: "Apex MEP Consulting", status: "Pending", bidAmount: 4350000, scheduledValue: 4500000, notes: "Waiting on final scope confirmation" }
];

function getKey() {
    return `cmware_buyout_${getCurrentProjectId()}`;
}

function getBuyout() {
    const key = getKey();
    const stored = localStorage.getItem(key);
    if (!stored) {
        localStorage.setItem(key, JSON.stringify(SEED_BUYOUT));
        return [...SEED_BUYOUT];
    }
    try { return JSON.parse(stored); } catch { return [...SEED_BUYOUT]; }
}

function setBuyout(data) {
    localStorage.setItem(getKey(), JSON.stringify(data));
    document.dispatchEvent(new CustomEvent("buyout-changed"));
}

function fmtCurrency(v) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}

export class Buyout {
    constructor() {
        this.searchTerm = "";
    }

    render() {
        const rows = this._getFiltered();

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Financial Controls — Phase 2</span>
                    <h1>Buyout & Procurement</h1>
                    <p>Bid solicitation, evaluation, and subcontract award tracking.</p>
                </div>
                <div class="toolbar">
                    <button class="button primary" id="btn-add-buyout" type="button"><i data-lucide="plus"></i> Add Bid Package</button>
                </div>
            </section>

            <div class="form-grid" style="margin-bottom: 1rem; max-width: 500px;">
                <div class="field">
                    <label>Search</label>
                    <div class="input-with-icon"><i data-lucide="search"></i><input class="input" id="buyout-search" type="search" placeholder="Filter by trade, vendor, number..."></div>
                </div>
            </div>

            ${Card.render({
                title: "Bid Packages",
                eyebrow: `${rows.length} packages`,
                body: `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Number</th>
                                    <th>Trade</th>
                                    <th>Vendor</th>
                                    <th>Status</th>
                                    <th style="text-align: right;">Bid Amount</th>
                                    <th style="text-align: right;">Scheduled Value</th>
                                    <th>Notes</th>
                                    <th style="text-align: right;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="buyout-tbody">
                                ${this._renderRows(rows)}
                            </tbody>
                        </table>
                    </div>
                `
            })}
        `;
    }

    _getFiltered() {
        let data = getBuyout();
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            data = data.filter(r => r.number.toLowerCase().includes(term) || r.trade.toLowerCase().includes(term) || r.vendor.toLowerCase().includes(term));
        }
        return data;
    }

    _renderRows(rows) {
        return rows.map(r => `
            <tr>
                <td><strong class="text-primary">${r.number}</strong></td>
                <td>${r.trade}</td>
                <td>${r.vendor}</td>
                <td><span class="badge ${STATUS_BADGES[r.status] || "neutral"}">${r.status}</span></td>
                <td style="text-align: right;">${fmtCurrency(r.bidAmount)}</td>
                <td style="text-align: right;">${fmtCurrency(r.scheduledValue)}</td>
                <td>${r.notes}</td>
                <td style="text-align: right;">
                    <button class="button small ghost" type="button" data-action="edit-buyout" data-id="${r.id}"><i data-lucide="edit-3"></i></button>
                    <button class="button small ghost danger" type="button" data-action="delete-buyout" data-id="${r.id}"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `).join("");
    }

    bind() {
        document.getElementById("buyout-search")?.addEventListener("input", (e) => {
            this.searchTerm = e.target.value;
            this._refreshTable();
        });

        document.getElementById("btn-add-buyout")?.addEventListener("click", () => this._openAddModal());

        this._bindActions();
        window.lucide?.createIcons();
    }

    _refreshTable() {
        const tbody = document.getElementById("buyout-tbody");
        if (tbody) {
            tbody.innerHTML = this._renderRows(this._getFiltered());
            this._bindActions();
            window.lucide?.createIcons();
        }
    }

    _bindActions() {
        document.querySelectorAll("[data-action='edit-buyout']").forEach(btn => {
            btn.addEventListener("click", () => {
                const item = getBuyout().find(r => r.id === btn.dataset.id);
                if (item) this._openEditModal(item);
            });
        });
        document.querySelectorAll("[data-action='delete-buyout']").forEach(btn => {
            btn.addEventListener("click", () => {
                if (confirm("Delete this bid package?")) {
                    setBuyout(getBuyout().filter(r => r.id !== btn.dataset.id));
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Bid package deleted" }));
                    this._refreshTable();
                }
            });
        });
    }

    _openAddModal() {
        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "Add Bid Package",
                body: `
                    <form id="form-add-buyout" class="record-form">
                        <div class="form-grid">
                            <div class="field">
                                <label for="bo-number">Bid Number *</label>
                                <input class="input" id="bo-number" name="number" required placeholder="e.g. BID-004">
                            </div>
                            <div class="field">
                                <label for="bo-trade">Trade *</label>
                                <input class="input" id="bo-trade" name="trade" required placeholder="e.g. Plumbing">
                            </div>
                        </div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="bo-vendor">Vendor *</label>
                                <input class="input" id="bo-vendor" name="vendor" required placeholder="e.g. ABC Plumbing Co.">
                            </div>
                            <div class="field">
                                <label for="bo-status">Status</label>
                                <select class="select" id="bo-status" name="status">
                                    <option value="Pending">Pending</option>
                                    <option value="Awarded">Awarded</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="bo-bid">Bid Amount *</label>
                                <input class="input" id="bo-bid" name="bidAmount" type="number" required>
                            </div>
                            <div class="field">
                                <label for="bo-sched">Scheduled Value</label>
                                <input class="input" id="bo-sched" name="scheduledValue" type="number">
                            </div>
                        </div>
                        <div class="field">
                            <label for="bo-notes">Notes</label>
                            <input class="input" id="bo-notes" name="notes" placeholder="Additional notes...">
                        </div>
                        <div class="split" style="margin-top: 0.75rem;">
                            <span></span>
                            <button class="button primary" type="submit"><i data-lucide="check"></i> Add Bid Package</button>
                        </div>
                    </form>
                `,
                onSubmit: (vals) => {
                    const bid = {
                        id: `buy-${Date.now()}`,
                        number: vals.number,
                        trade: vals.trade,
                        vendor: vals.vendor,
                        status: vals.status || "Pending",
                        bidAmount: Number(vals.bidAmount || 0),
                        scheduledValue: Number(vals.scheduledValue || 0),
                        notes: vals.notes || ""
                    };
                    const all = getBuyout();
                    if (all.some(r => r.number === bid.number)) {
                        document.dispatchEvent(new CustomEvent("toast", { detail: "Bid number already exists" }));
                        return false;
                    }
                    all.push(bid);
                    setBuyout(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `Bid ${bid.number} added` }));
                }
            }
        }));
        setTimeout(() => window.lucide?.createIcons(), 50);
    }

    _openEditModal(item) {
        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: `Edit ${item.number} — ${item.trade}`,
                body: `
                    <form id="form-edit-buyout" class="record-form">
                        <div class="field">
                            <label>Bid Number</label>
                            <input class="input" value="${item.number}" disabled>
                        </div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="boE-trade">Trade *</label>
                                <input class="input" id="boE-trade" name="trade" value="${item.trade}" required>
                            </div>
                            <div class="field">
                                <label for="boE-vendor">Vendor *</label>
                                <input class="input" id="boE-vendor" name="vendor" value="${item.vendor}" required>
                            </div>
                        </div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="boE-bid">Bid Amount *</label>
                                <input class="input" id="boE-bid" name="bidAmount" type="number" value="${item.bidAmount}" required>
                            </div>
                            <div class="field">
                                <label for="boE-sched">Scheduled Value</label>
                                <input class="input" id="boE-sched" name="scheduledValue" type="number" value="${item.scheduledValue}">
                            </div>
                        </div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="boE-status">Status</label>
                                <select class="select" id="boE-status" name="status">
                                    <option value="Pending"${item.status === "Pending" ? " selected" : ""}>Pending</option>
                                    <option value="Awarded"${item.status === "Awarded" ? " selected" : ""}>Awarded</option>
                                    <option value="Rejected"${item.status === "Rejected" ? " selected" : ""}>Rejected</option>
                                </select>
                            </div>
                            <div class="field">
                                <label for="boE-notes">Notes</label>
                                <input class="input" id="boE-notes" name="notes" value="${item.notes}">
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
                        trade: vals.trade,
                        vendor: vals.vendor,
                        bidAmount: Number(vals.bidAmount || item.bidAmount),
                        scheduledValue: Number(vals.scheduledValue || item.scheduledValue),
                        status: vals.status || item.status,
                        notes: vals.notes
                    };
                    setBuyout(getBuyout().map(r => r.id === item.id ? updated : r));
                    document.dispatchEvent(new CustomEvent("toast", { detail: `${item.number} updated` }));
                }
            }
        }));
        setTimeout(() => window.lucide?.createIcons(), 50);
    }
}
