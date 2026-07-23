import { recordStore } from "../recordStore.js";
import { Card, MetricCard } from "../components/Card.js";
import { Tabs } from "../components/Tabs.js";

const FINANCIAL_TABS = ["Budget & Cost Codes", "Subcontracts (S-Codes)", "Change Exposure"];

// Standard CSI cost code categories used for S-Code subcontract linking
const SCODES = {
    "01 30 00": "Project Management & Field Supervision",
    "03 30 00": "Cast-in-Place Concrete & Reinforcing",
    "05 10 00": "Structural Steel Framing",
    "07 42 13": "Insulated Metal Panels & Envelope",
    "08 00 00": "Openings – Doors, Frames & Hardware",
    "09 00 00": "Finishes – Drywall, Flooring & Paint",
    "21 00 00": "Fire Suppression Systems",
    "22 00 00": "Plumbing Systems",
    "23 00 00": "HVAC & Mechanical Systems",
    "26 00 00": "Electrical Distribution & Lighting",
    "27 00 00": "Communications & Low Voltage"
};

export class Financials {
    constructor() {
        this.currentTab = FINANCIAL_TABS[0];
    }

    render() {
        const budgetItems = recordStore.getBudget();
        const subcontracts = recordStore.getSubcontracts();
        const records = recordStore.all();
        const settings = recordStore.getSettings();

        const approvedCost = records
            .filter((r) => r.status === "Approved" && Number(r.cost || 0) > 0)
            .reduce((sum, r) => sum + Number(r.cost || 0), 0);

        const pendingCost = records
            .filter((r) => ["Open","Pricing","Submitted","In Review"].includes(r.status) && Number(r.cost || 0) > 0)
            .reduce((sum, r) => sum + Number(r.cost || 0), 0);

        const totalOriginal = budgetItems.reduce((s, b) => s + b.originalBudget, 0);
        const totalRevised   = budgetItems.reduce((s, b) => s + b.revisedBudget, 0);
        const totalCommit    = budgetItems.reduce((s, b) => s + b.commitments, 0);
        const totalRemain    = budgetItems.reduce((s, b) => s + b.remainingBalance, 0);
        const totalSubcont   = subcontracts.reduce((s, sc) => s + Number(sc.value || 0), 0);

        const metrics = [
            ["Original Contract", this.money(totalOriginal), "Base prime contract", "neutral"],
            ["Approved CO Value", this.money(approvedCost), "Executed change orders", "good"],
            ["Revised Contract", this.money(totalRevised), "Base + Approved COs", "neutral"],
            ["Pending Exposure", this.money(pendingCost), "Potential cost impacts", "warn"],
            ["Total Subcontracts", this.money(totalSubcont), `${subcontracts.length} active contracts`, "neutral"],
            ["Uncommitted Budget", this.money(totalRemain), "Remaining contingency", totalRemain >= 0 ? "good" : "bad"]
        ];

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Financial Controls</span>
                    <h1>Project Budget, Commitments & Cost Exposure</h1>
                    <p>Track CSI cost codes, subcontract commitments (S-Codes), and change order financial exposure.</p>
                </div>
                <div class="toolbar">
                    <button class="button" onclick="window.print()" type="button"><i data-lucide="printer"></i> Print Summary</button>
                    <button class="button primary" id="btn-fin-primary-action" type="button"><i data-lucide="plus"></i> Add</button>
                </div>
            </section>

            <section class="metric-grid">
                ${metrics.map((m) => MetricCard.render(m)).join("")}
            </section>

            ${Tabs.render(FINANCIAL_TABS, this.currentTab)}

            <div id="fin-tab-content">
                ${this._renderTabContent(this.currentTab, budgetItems, subcontracts, records)}
            </div>
        `;
    }

    _renderTabContent(tab, budgetItems, subcontracts, records) {
        if (tab === "Budget & Cost Codes") return this._renderBudget(budgetItems);
        if (tab === "Subcontracts (S-Codes)") return this._renderSubcontracts(subcontracts, budgetItems);
        if (tab === "Change Exposure") return this._renderChangeExposure(records);
        return "";
    }

    _renderBudget(budgetItems) {
        return `
            ${Card.render({
                title: "CSI MasterFormat Budget Ledger",
                eyebrow: "Cost Code Register",
                actions: `<button class="button small primary" id="btn-add-cost-code" type="button"><i data-lucide="plus"></i> Add Cost Code</button>`,
                body: `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Cost Code</th>
                                    <th>Description</th>
                                    <th>Original Budget</th>
                                    <th>Approved Changes</th>
                                    <th>Revised Budget</th>
                                    <th>Commitments</th>
                                    <th>Pending Exposure</th>
                                    <th>Remaining</th>
                                    <th style="text-align:right;">Edit</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${budgetItems.map((b) => `
                                    <tr>
                                        <td><strong>${b.costCode}</strong></td>
                                        <td>${b.description}</td>
                                        <td>${this.money(b.originalBudget)}</td>
                                        <td class="${b.approvedChanges > 0 ? "text-success" : ""}">${this.money(b.approvedChanges)}</td>
                                        <td><strong>${this.money(b.revisedBudget)}</strong></td>
                                        <td>${this.money(b.commitments)}</td>
                                        <td class="${b.pendingExposure > 0 ? "text-danger" : ""}">${this.money(b.pendingExposure)}</td>
                                        <td><strong class="${b.remainingBalance < 0 ? "text-danger" : "text-success"}">${this.money(b.remainingBalance)}</strong></td>
                                        <td style="text-align:right;">
                                            <button class="button small ghost" type="button"
                                                data-action="edit-budget-line" data-cost-code="${b.costCode}">
                                                <i data-lucide="edit-3"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join("")}
                            </tbody>
                            <tfoot>
                                <tr style="border-top:2px solid var(--color-border);font-weight:700;">
                                    <td colspan="2"><strong>TOTALS</strong></td>
                                    <td>${this.money(budgetItems.reduce((s,b) => s+b.originalBudget, 0))}</td>
                                    <td>${this.money(budgetItems.reduce((s,b) => s+b.approvedChanges, 0))}</td>
                                    <td><strong>${this.money(budgetItems.reduce((s,b) => s+b.revisedBudget, 0))}</strong></td>
                                    <td>${this.money(budgetItems.reduce((s,b) => s+b.commitments, 0))}</td>
                                    <td class="text-danger">${this.money(budgetItems.reduce((s,b) => s+b.pendingExposure, 0))}</td>
                                    <td><strong class="${budgetItems.reduce((s,b) => s+b.remainingBalance, 0) < 0 ? "text-danger" : "text-success"}">${this.money(budgetItems.reduce((s,b) => s+b.remainingBalance, 0))}</strong></td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                `
            })}
        `;
    }

    _renderSubcontracts(subcontracts, budgetItems) {
        const costCodeOptions = budgetItems.map((b) =>
            `<option value="${b.costCode}">${b.costCode} — ${b.description}</option>`
        ).join("");

        return `
            <div style="margin-bottom:0.75rem;display:flex;justify-content:flex-end;">
                <button class="button primary" id="btn-add-subcontract" type="button">
                    <i data-lucide="plus"></i> Add Subcontract
                </button>
            </div>
            ${Card.render({
                title: "Subcontract Commitments (S-Codes)",
                eyebrow: "Trade Contract Register",
                body: subcontracts.length ? `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>S-Code</th>
                                    <th>Trade / Subcontractor</th>
                                    <th>Linked Cost Code</th>
                                    <th>Scope Summary</th>
                                    <th>Contract Value</th>
                                    <th>Executed Date</th>
                                    <th>Status</th>
                                    <th style="text-align:right;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${subcontracts.map((sc) => `
                                    <tr>
                                        <td><strong class="text-primary">${sc.scode}</strong></td>
                                        <td>
                                            <div class="table-title-cell">
                                                <span class="cell-title">${sc.company}</span>
                                                <span class="cell-subtext">${sc.trade}</span>
                                            </div>
                                        </td>
                                        <td><span class="badge neutral">${sc.costCode || "—"}</span></td>
                                        <td>${sc.scope || "—"}</td>
                                        <td><strong>${this.money(sc.value || 0)}</strong></td>
                                        <td>${sc.executedDate || "Pending"}</td>
                                        <td><span class="badge ${sc.status === "Executed" ? "success" : sc.status === "Pending" ? "warning" : "neutral"}">${sc.status}</span></td>
                                        <td style="text-align:right;">
                                            <button class="button small ghost" type="button"
                                                data-action="edit-subcontract" data-sc-id="${sc.id}">
                                                <i data-lucide="edit-3"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join("")}
                            </tbody>
                            <tfoot>
                                <tr style="border-top:2px solid var(--color-border);">
                                    <td colspan="4"><strong>TOTAL SUBCONTRACT COMMITMENTS</strong></td>
                                    <td colspan="4"><strong>${this.money(subcontracts.reduce((s,sc) => s + Number(sc.value||0), 0))}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ` : `<div class="empty-inline">No subcontracts added yet. Click "Add Subcontract" to create the first S-Code commitment.</div>`
            })}
        `;
    }

    _renderChangeExposure(records) {
        const changeModules = ["change-events", "change-orders", "ccds", "asis", "proposal-requests"];
        const changeRecords = records.filter((r) => changeModules.includes(r.module));
        const withCost    = changeRecords.filter((r) => Number(r.cost || 0) > 0);
        const withoutCost = changeRecords.filter((r) => !Number(r.cost || 0));
        const approved    = withCost.filter((r) => r.status === "Approved");
        const pending     = withCost.filter((r) => ["Open","Pricing","Submitted","In Review"].includes(r.status));

        return `
            <div class="form-grid" style="margin-bottom:1rem;">
                ${Card.render({ title: "Approved Change Value", eyebrow: "Executed", body: `<div class="metric-value text-success">${this.money(approved.reduce((s,r) => s+Number(r.cost||0), 0))}</div><p class="muted">${approved.length} approved change items</p>` })}
                ${Card.render({ title: "Pending Cost Exposure", eyebrow: "At Risk", body: `<div class="metric-value text-danger">${this.money(pending.reduce((s,r) => s+Number(r.cost||0), 0))}</div><p class="muted">${pending.length} items under review</p>` })}
                ${Card.render({ title: "No-Cost Change Items", eyebrow: "Administrative", body: `<div class="metric-value">${withoutCost.length}</div><p class="muted">Directives, ASIs, clarifications — $0 cost</p>` })}
            </div>

            ${Card.render({
                title: "All Change Events & Orders — Cost Exposure Register",
                eyebrow: "Change Ledger",
                body: changeRecords.length ? `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Number</th>
                                    <th>Title</th>
                                    <th>Module</th>
                                    <th>Status</th>
                                    <th>Assignee</th>
                                    <th>Cost Impact</th>
                                    <th>Has Cost?</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${changeRecords.map((r) => {
                                    const hasCost = Number(r.cost || 0) > 0;
                                    return `
                                        <tr>
                                            <td><strong class="text-primary">${r.number}</strong></td>
                                            <td>${r.title}</td>
                                            <td><span class="badge neutral">${r.module}</span></td>
                                            <td><span class="badge ${r.status === "Approved" ? "success" : r.status === "Pricing" || r.status === "Submitted" ? "warning" : "neutral"}">${r.status}</span></td>
                                            <td>${r.ballInCourt || r.assignedTo || "—"}</td>
                                            <td class="${hasCost ? "text-danger" : "text-muted"}">${hasCost ? this.money(Number(r.cost)) : "N/A ($0)"}</td>
                                            <td>${hasCost ? '<span class="badge warning">Cost Item</span>' : '<span class="badge neutral">No Cost</span>'}</td>
                                        </tr>
                                    `;
                                }).join("")}
                            </tbody>
                        </table>
                    </div>
                ` : `<div class="empty-inline">No change items found. Create Change Events or Change Orders to track exposure here.</div>`
            })}
        `;
    }

    bind() {
        const main = document.getElementById("app-main");

        // ── Tab Switching ──────────────────────────────────────────────────
        main.querySelectorAll(".tab-button").forEach((btn) => {
            btn.addEventListener("click", () => {
                main.querySelectorAll(".tab-button").forEach((b) => {
                    b.classList.remove("active");
                    b.setAttribute("aria-selected", "false");
                });
                btn.classList.add("active");
                btn.setAttribute("aria-selected", "true");
                this.currentTab = btn.dataset.tab || btn.textContent.trim();

                // Update primary action button label
                const primaryBtn = document.getElementById("btn-fin-primary-action");
                if (primaryBtn) {
                    if (this.currentTab === "Budget & Cost Codes") primaryBtn.innerHTML = `<i data-lucide="plus"></i> Add Cost Code`;
                    else if (this.currentTab === "Subcontracts (S-Codes)") primaryBtn.innerHTML = `<i data-lucide="plus"></i> Add Subcontract`;
                    else primaryBtn.innerHTML = `<i data-lucide="file-plus"></i> Add Change Item`;
                    window.lucide?.createIcons();
                }

                // Re-render tab content
                const tabContent = document.getElementById("fin-tab-content");
                if (tabContent) {
                    tabContent.innerHTML = this._renderTabContent(
                        this.currentTab,
                        recordStore.getBudget(),
                        recordStore.getSubcontracts(),
                        recordStore.all()
                    );
                    window.lucide?.createIcons();
                    this._bindTabActions();
                }
            });
        });

        // Primary Add button
        document.getElementById("btn-fin-primary-action")?.addEventListener("click", () => {
            if (this.currentTab === "Budget & Cost Codes") this._openAddCostCode();
            else if (this.currentTab === "Subcontracts (S-Codes)") this._openAddSubcontract();
            else location.hash = "#/change-events";
        });

        this._bindTabActions();
    }

    _bindTabActions() {
        const main = document.getElementById("app-main");

        // Budget line edit
        main.querySelectorAll("[data-action='edit-budget-line']").forEach((btn) => {
            btn.addEventListener("click", () => {
                const costCode = btn.dataset.costCode;
                const item = recordStore.getBudget().find((b) => b.costCode === costCode);
                if (item) this._openEditBudgetLine(item);
            });
        });

        // Add cost code inline button
        document.getElementById("btn-add-cost-code")?.addEventListener("click", () => this._openAddCostCode());

        // Add subcontract inline button
        document.getElementById("btn-add-subcontract")?.addEventListener("click", () => this._openAddSubcontract());

        // Edit subcontract
        main.querySelectorAll("[data-action='edit-subcontract']").forEach((btn) => {
            btn.addEventListener("click", () => {
                const sc = recordStore.getSubcontracts().find((s) => s.id === btn.dataset.scId);
                if (sc) this._openEditSubcontract(sc);
            });
        });
    }

    _openAddCostCode() {
        const body = `
            <form id="form-add-costcode" class="record-form">
                <div class="form-grid">
                    <div class="field">
                        <label for="cc-code">CSI Cost Code</label>
                        <input class="input" id="cc-code" name="costCode" required placeholder="e.g. 09 90 00">
                    </div>
                    <div class="field">
                        <label for="cc-desc">Description</label>
                        <input class="input" id="cc-desc" name="description" required placeholder="e.g. Painting & Coatings">
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="cc-orig">Original Budget ($)</label>
                        <input class="input" id="cc-orig" name="originalBudget" type="number" min="0" value="0">
                    </div>
                    <div class="field">
                        <label for="cc-commit">Commitments ($)</label>
                        <input class="input" id="cc-commit" name="commitments" type="number" min="0" value="0">
                    </div>
                </div>
                <div class="split" style="margin-top:0.75rem;">
                    <span></span>
                    <button class="button primary" type="submit"><i data-lucide="check"></i> Add Cost Code</button>
                </div>
            </form>
        `;
        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "Add CSI Cost Code Line",
                body,
                onSubmit: (vals) => {
                    recordStore.addBudgetLine(vals);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `Cost code ${vals.costCode} added` }));
                    location.hash = "#/financials";
                }
            }
        }));
    }

    _openEditBudgetLine(item) {
        const body = `
            <form id="form-edit-budget" class="record-form">
                <div class="form-grid">
                    <div class="field">
                        <label>Cost Code</label>
                        <input class="input" value="${item.costCode}" disabled>
                    </div>
                    <div class="field">
                        <label for="bl-desc">Description</label>
                        <input class="input" id="bl-desc" name="description" value="${item.description}">
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="bl-orig">Original Budget ($)</label>
                        <input class="input" id="bl-orig" name="originalBudget" type="number" value="${item.originalBudget}">
                    </div>
                    <div class="field">
                        <label for="bl-approved">Approved Changes ($)</label>
                        <input class="input" id="bl-approved" name="approvedChanges" type="number" value="${item.approvedChanges}">
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="bl-commit">Commitments ($)</label>
                        <input class="input" id="bl-commit" name="commitments" type="number" value="${item.commitments}">
                    </div>
                    <div class="field">
                        <label for="bl-pending">Pending Exposure ($)</label>
                        <input class="input" id="bl-pending" name="pendingExposure" type="number" value="${item.pendingExposure}">
                    </div>
                </div>
                <div class="split" style="margin-top:0.75rem;">
                    <span class="muted">Revised Budget & Remaining calculated automatically</span>
                    <button class="button primary" type="submit"><i data-lucide="save"></i> Save Changes</button>
                </div>
            </form>
        `;
        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: `Edit ${item.costCode} — ${item.description}`,
                body,
                onSubmit: (vals) => {
                    recordStore.updateBudgetLine(item.costCode, vals);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `${item.costCode} updated` }));
                    location.hash = "#/financials";
                }
            }
        }));
    }

    _openAddSubcontract() {
        const budgetItems = recordStore.getBudget();
        const existing = recordStore.getSubcontracts();
        const nextNum = `SC-${String(existing.length + 1).padStart(4, "0")}`;

        const body = `
            <form id="form-add-subcontract" class="record-form">
                <div class="form-grid">
                    <div class="field">
                        <label for="sc-num">S-Code Number</label>
                        <input class="input" id="sc-num" name="scode" value="${nextNum}" required>
                    </div>
                    <div class="field">
                        <label for="sc-company">Subcontractor Company</label>
                        <input class="input" id="sc-company" name="company" required placeholder="e.g. Hardrock Concrete LLC">
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="sc-trade">Trade / Discipline</label>
                        <input class="input" id="sc-trade" name="trade" required placeholder="e.g. Concrete & Forming">
                    </div>
                    <div class="field">
                        <label for="sc-costcode">Linked CSI Cost Code</label>
                        <select class="select" id="sc-costcode" name="costCode">
                            <option value="">-- Select Cost Code --</option>
                            ${budgetItems.map((b) => `<option value="${b.costCode}">${b.costCode} — ${b.description}</option>`).join("")}
                        </select>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="sc-value">Contract Value ($)</label>
                        <input class="input" id="sc-value" name="value" type="number" min="0" value="0" required>
                    </div>
                    <div class="field">
                        <label for="sc-status">Status</label>
                        <select class="select" id="sc-status" name="status">
                            <option>Pending</option>
                            <option>Executed</option>
                            <option>Voided</option>
                        </select>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="sc-date">Execution Date</label>
                        <input class="input" id="sc-date" name="executedDate" type="date">
                    </div>
                    <div class="field">
                        <label for="sc-contact">Primary Contact</label>
                        <input class="input" id="sc-contact" name="contact" placeholder="e.g. John Smith">
                    </div>
                </div>
                <div class="field">
                    <label for="sc-scope">Scope Summary</label>
                    <textarea class="textarea" id="sc-scope" name="scope" rows="2" placeholder="Brief scope description..."></textarea>
                </div>
                <div class="split" style="margin-top:0.75rem;">
                    <span class="muted">Next: ${nextNum}</span>
                    <button class="button primary" type="submit"><i data-lucide="check"></i> Create Subcontract</button>
                </div>
            </form>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "Add Subcontract (S-Code)",
                body,
                onSubmit: (vals) => {
                    recordStore.addSubcontract(vals);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `${vals.scode} — ${vals.company} added` }));
                    location.hash = "#/financials";
                }
            }
        }));
    }

    _openEditSubcontract(sc) {
        const budgetItems = recordStore.getBudget();
        const body = `
            <form id="form-edit-subcontract" class="record-form">
                <div class="form-grid">
                    <div class="field">
                        <label>S-Code</label>
                        <input class="input" value="${sc.scode}" disabled>
                    </div>
                    <div class="field">
                        <label for="scE-company">Company</label>
                        <input class="input" id="scE-company" name="company" value="${sc.company}" required>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="scE-value">Contract Value ($)</label>
                        <input class="input" id="scE-value" name="value" type="number" value="${sc.value || 0}">
                    </div>
                    <div class="field">
                        <label for="scE-status">Status</label>
                        <select class="select" id="scE-status" name="status">
                            ${["Pending","Executed","Voided"].map((s) => `<option${sc.status===s?" selected":""}>${s}</option>`).join("")}
                        </select>
                    </div>
                </div>
                <div class="field">
                    <label for="scE-scope">Scope Summary</label>
                    <textarea class="textarea" id="scE-scope" name="scope" rows="2">${sc.scope || ""}</textarea>
                </div>
                <div class="split" style="margin-top:0.75rem;">
                    <span></span>
                    <button class="button primary" type="submit"><i data-lucide="save"></i> Save Changes</button>
                </div>
            </form>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: `Edit ${sc.scode} — ${sc.company}`,
                body,
                onSubmit: (vals) => {
                    recordStore.updateSubcontract(sc.id, vals);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `${sc.scode} updated` }));
                    location.hash = "#/financials";
                }
            }
        }));
    }

    money(val) {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val || 0);
    }
}
