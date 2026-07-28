import { Card } from "../../components/Card.js";

function getCurrentProjectId() {
    return localStorage.getItem("cm.selectedProject") || "RIV-104";
}

const SEED_BUDGET = [
    { costCode: "01 31 00", description: "Project Management & Field Supervision", originalBudget: 2400000, approvedChanges: 45000, revisedBudget: 2445000, commitments: 2400000, pendingExposure: 15000, remainingBalance: 30000 },
    { costCode: "03 30 00", description: "Cast-in-Place Concrete & Reinforcing", originalBudget: 8600000, approvedChanges: 184000, revisedBudget: 8784000, commitments: 8650000, pendingExposure: 64000, remainingBalance: 70000 },
    { costCode: "07 42 13", description: "Insulated Metal Panels & Envelope", originalBudget: 4200000, approvedChanges: 0, revisedBudget: 4200000, commitments: 4150000, pendingExposure: 84200, remainingBalance: -34200 },
    { costCode: "26 00 00", description: "Electrical Distribution & Lighting", originalBudget: 6800000, approvedChanges: 28500, revisedBudget: 6828500, commitments: 6750000, pendingExposure: 28500, remainingBalance: 50000 }
];

function getKey() {
    return `cmware_budget_${getCurrentProjectId()}`;
}

function getBudget() {
    const key = getKey();
    const stored = localStorage.getItem(key);
    if (!stored) {
        localStorage.setItem(key, JSON.stringify(SEED_BUDGET));
        return [...SEED_BUDGET];
    }
    try { return JSON.parse(stored); } catch { return [...SEED_BUDGET]; }
}

function setBudget(data) {
    localStorage.setItem(getKey(), JSON.stringify(data));
    document.dispatchEvent(new CustomEvent("budget-changed"));
}

function fmtCurrency(v) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}

export class Budget {
    constructor() {
        this.searchTerm = "";
    }

    render() {
        const rows = this._getFiltered();
        const totals = this._getTotals();

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Financial Controls — Phase 1</span>
                    <h1>Project Budget</h1>
                    <p>Budget lines by CSI cost code with commitment tracking and exposure analysis.</p>
                </div>
                <div class="toolbar">
                    <button class="button primary" id="btn-add-budget" type="button"><i data-lucide="plus"></i> Add Budget Line</button>
                </div>
            </section>

            <div class="form-grid" style="margin-bottom: 1rem; max-width: 500px;">
                <div class="field">
                    <label>Search</label>
                    <div class="input-with-icon"><i data-lucide="search"></i><input class="input" id="budget-search" type="search" placeholder="Filter by cost code or description..."></div>
                </div>
            </div>

            ${Card.render({
                title: "Budget Summary",
                eyebrow: `${rows.length} line items`,
                body: `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Cost Code</th>
                                    <th>Description</th>
                                    <th style="text-align: right;">Original Budget</th>
                                    <th style="text-align: right;">Approved Changes</th>
                                    <th style="text-align: right;">Revised Budget</th>
                                    <th style="text-align: right;">Commitments</th>
                                    <th style="text-align: right;">Pending Exposure</th>
                                    <th style="text-align: right;">Remaining Balance</th>
                                    <th style="text-align: right;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="budget-tbody">
                                ${this._renderRows(rows)}
                                <tr class="total-row">
                                    <td><strong>TOTALS</strong></td>
                                    <td></td>
                                    <td style="text-align: right;"><strong>${fmtCurrency(totals.originalBudget)}</strong></td>
                                    <td style="text-align: right;"><strong>${fmtCurrency(totals.approvedChanges)}</strong></td>
                                    <td style="text-align: right;"><strong>${fmtCurrency(totals.revisedBudget)}</strong></td>
                                    <td style="text-align: right;"><strong>${fmtCurrency(totals.commitments)}</strong></td>
                                    <td style="text-align: right;"><strong>${fmtCurrency(totals.pendingExposure)}</strong></td>
                                    <td style="text-align: right;"><strong>${fmtCurrency(totals.remainingBalance)}</strong></td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `
            })}
        `;
    }

    _getFiltered() {
        let data = getBudget();
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            data = data.filter(r => r.costCode.toLowerCase().includes(term) || r.description.toLowerCase().includes(term));
        }
        return data;
    }

    _getTotals() {
        const data = getBudget();
        return data.reduce((acc, r) => ({
            originalBudget: acc.originalBudget + (r.originalBudget || 0),
            approvedChanges: acc.approvedChanges + (r.approvedChanges || 0),
            revisedBudget: acc.revisedBudget + (r.revisedBudget || 0),
            commitments: acc.commitments + (r.commitments || 0),
            pendingExposure: acc.pendingExposure + (r.pendingExposure || 0),
            remainingBalance: acc.remainingBalance + (r.remainingBalance || 0)
        }), { originalBudget: 0, approvedChanges: 0, revisedBudget: 0, commitments: 0, pendingExposure: 0, remainingBalance: 0 });
    }

    _renderRows(rows) {
        return rows.map(r => `
            <tr>
                <td><strong class="text-primary">${r.costCode}</strong></td>
                <td>${r.description}</td>
                <td style="text-align: right;">${fmtCurrency(r.originalBudget)}</td>
                <td style="text-align: right;">${fmtCurrency(r.approvedChanges)}</td>
                <td style="text-align: right;">${fmtCurrency(r.revisedBudget)}</td>
                <td style="text-align: right;">${fmtCurrency(r.commitments)}</td>
                <td style="text-align: right;">${fmtCurrency(r.pendingExposure)}</td>
                <td style="text-align: right; color: ${r.remainingBalance < 0 ? 'var(--color-danger)' : 'var(--color-success)'};">${fmtCurrency(r.remainingBalance)}</td>
                <td style="text-align: right;">
                    <button class="button small ghost" type="button" data-action="edit-budget" data-code="${r.costCode}"><i data-lucide="edit-3"></i></button>
                    <button class="button small ghost danger" type="button" data-action="delete-budget" data-code="${r.costCode}"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `).join("");
    }

    bind() {
        document.getElementById("budget-search")?.addEventListener("input", (e) => {
            this.searchTerm = e.target.value;
            this._refreshTable();
        });

        document.getElementById("btn-add-budget")?.addEventListener("click", () => this._openAddModal());

        this._bindActions();
        window.lucide?.createIcons();
    }

    _refreshTable() {
        const tbody = document.getElementById("budget-tbody");
        if (tbody) {
            const rows = this._getFiltered();
            const totals = this._getTotals();
            tbody.innerHTML = this._renderRows(rows) + `
                <tr class="total-row">
                    <td><strong>TOTALS</strong></td>
                    <td></td>
                    <td style="text-align: right;"><strong>${fmtCurrency(totals.originalBudget)}</strong></td>
                    <td style="text-align: right;"><strong>${fmtCurrency(totals.approvedChanges)}</strong></td>
                    <td style="text-align: right;"><strong>${fmtCurrency(totals.revisedBudget)}</strong></td>
                    <td style="text-align: right;"><strong>${fmtCurrency(totals.commitments)}</strong></td>
                    <td style="text-align: right;"><strong>${fmtCurrency(totals.pendingExposure)}</strong></td>
                    <td style="text-align: right;"><strong>${fmtCurrency(totals.remainingBalance)}</strong></td>
                    <td></td>
                </tr>
            `;
            this._bindActions();
            window.lucide?.createIcons();
        }
    }

    _bindActions() {
        document.querySelectorAll("[data-action='edit-budget']").forEach(btn => {
            btn.addEventListener("click", () => {
                const item = getBudget().find(r => r.costCode === btn.dataset.code);
                if (item) this._openEditModal(item);
            });
        });
        document.querySelectorAll("[data-action='delete-budget']").forEach(btn => {
            btn.addEventListener("click", () => {
                if (confirm(`Delete budget line ${btn.dataset.code}?`)) {
                    setBudget(getBudget().filter(r => r.costCode !== btn.dataset.code));
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Budget line deleted" }));
                    this._refreshTable();
                }
            });
        });
    }

    _openAddModal() {
        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "Add Budget Line",
                body: `
                    <form id="form-add-budget" class="record-form">
                        <div class="form-grid">
                            <div class="field">
                                <label for="b-code">Cost Code *</label>
                                <input class="input" id="b-code" name="costCode" required placeholder="e.g. 09 90 00">
                            </div>
                            <div class="field">
                                <label for="b-desc">Description *</label>
                                <input class="input" id="b-desc" name="description" required placeholder="e.g. Painting & Coatings">
                            </div>
                        </div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="b-orig">Original Budget *</label>
                                <input class="input" id="b-orig" name="originalBudget" type="number" required>
                            </div>
                            <div class="field">
                                <label for="b-changes">Approved Changes</label>
                                <input class="input" id="b-changes" name="approvedChanges" type="number" value="0">
                            </div>
                        </div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="b-commit">Commitments</label>
                                <input class="input" id="b-commit" name="commitments" type="number" value="0">
                            </div>
                            <div class="field">
                                <label for="b-pending">Pending Exposure</label>
                                <input class="input" id="b-pending" name="pendingExposure" type="number" value="0">
                            </div>
                        </div>
                        <div class="split" style="margin-top: 0.75rem;">
                            <span></span>
                            <button class="button primary" type="submit"><i data-lucide="check"></i> Add Budget Line</button>
                        </div>
                    </form>
                `,
                onSubmit: (vals) => {
                    const orig = Number(vals.originalBudget || 0);
                    const changes = Number(vals.approvedChanges || 0);
                    const commit = Number(vals.commitments || 0);
                    const pending = Number(vals.pendingExposure || 0);
                    const line = {
                        costCode: vals.costCode,
                        description: vals.description,
                        originalBudget: orig,
                        approvedChanges: changes,
                        revisedBudget: orig + changes,
                        commitments: commit,
                        pendingExposure: pending,
                        remainingBalance: (orig + changes) - commit - pending
                    };
                    const all = getBudget();
                    if (all.some(r => r.costCode === line.costCode)) {
                        document.dispatchEvent(new CustomEvent("toast", { detail: "Cost code already exists" }));
                        return false;
                    }
                    all.push(line);
                    setBudget(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `Budget line ${line.costCode} added` }));
                }
            }
        }));
        setTimeout(() => window.lucide?.createIcons(), 50);
    }

    _openEditModal(item) {
        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: `Edit ${item.costCode} — ${item.description}`,
                body: `
                    <form id="form-edit-budget" class="record-form">
                        <div class="field">
                            <label>Cost Code</label>
                            <input class="input" value="${item.costCode}" disabled>
                        </div>
                        <div class="field">
                            <label for="bE-desc">Description *</label>
                            <input class="input" id="bE-desc" name="description" value="${item.description}" required>
                        </div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="bE-orig">Original Budget *</label>
                                <input class="input" id="bE-orig" name="originalBudget" type="number" value="${item.originalBudget}" required>
                            </div>
                            <div class="field">
                                <label for="bE-changes">Approved Changes</label>
                                <input class="input" id="bE-changes" name="approvedChanges" type="number" value="${item.approvedChanges}">
                            </div>
                        </div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="bE-commit">Commitments</label>
                                <input class="input" id="bE-commit" name="commitments" type="number" value="${item.commitments}">
                            </div>
                            <div class="field">
                                <label for="bE-pending">Pending Exposure</label>
                                <input class="input" id="bE-pending" name="pendingExposure" type="number" value="${item.pendingExposure}">
                            </div>
                        </div>
                        <div class="split" style="margin-top: 0.75rem;">
                            <span></span>
                            <button class="button primary" type="submit"><i data-lucide="save"></i> Save Changes</button>
                        </div>
                    </form>
                `,
                onSubmit: (vals) => {
                    const orig = Number(vals.originalBudget || item.originalBudget);
                    const changes = Number(vals.approvedChanges ?? item.approvedChanges);
                    const commit = Number(vals.commitments || item.commitments);
                    const pending = Number(vals.pendingExposure ?? item.pendingExposure);
                    const updated = {
                        ...item,
                        description: vals.description,
                        originalBudget: orig,
                        approvedChanges: changes,
                        revisedBudget: orig + changes,
                        commitments: commit,
                        pendingExposure: pending,
                        remainingBalance: (orig + changes) - commit - pending
                    };
                    setBudget(getBudget().map(r => r.costCode === item.costCode ? updated : r));
                    document.dispatchEvent(new CustomEvent("toast", { detail: `${item.costCode} updated` }));
                }
            }
        }));
        setTimeout(() => window.lucide?.createIcons(), 50);
    }
}
