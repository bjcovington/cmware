import { recordStore } from "../../recordStore.js";
import { Card } from "../../components/Card.js";
import { COST_TYPES, COST_CODE_STATUSES } from "../../constants.js";

const COST_CODES_KEY = "cmware_cost_codes";

const SEED_COST_CODES = [
    { code: "01 31 00", division: "01", description: "Project Management & Field Supervision", costType: "General Conditions", taxCategory: "Non-Taxable", budgetCategory: "Soft Costs", status: "Active" },
    { code: "01 50 00", division: "01", description: "Temporary Facilities & Controls", costType: "General Conditions", taxCategory: "Non-Taxable", budgetCategory: "Soft Costs", status: "Active" },
    { code: "02 41 00", division: "02", description: "Demolition & Site Clearing", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "Site Work", status: "Active" },
    { code: "03 30 00", division: "03", description: "Cast-in-Place Concrete & Reinforcing", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "Concrete", status: "Active" },
    { code: "04 20 00", division: "04", description: "Unit Masonry", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "Masonry", status: "Active" },
    { code: "05 10 00", division: "05", description: "Structural Steel Framing", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "Steel", status: "Active" },
    { code: "06 10 00", division: "06", description: "Rough Carpentry", costType: "Labor", taxCategory: "Taxable", budgetCategory: "Carpentry", status: "Active" },
    { code: "07 42 13", division: "07", description: "Insulated Metal Panels & Envelope", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "Envelope", status: "Active" },
    { code: "08 00 00", division: "08", description: "Openings – Doors, Frames & Hardware", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "Openings", status: "Active" },
    { code: "09 00 00", division: "09", description: "Finishes – Drywall, Flooring & Paint", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "Finishes", status: "Active" },
    { code: "21 00 00", division: "21", description: "Fire Suppression Systems", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "Fire Protection", status: "Active" },
    { code: "22 00 00", division: "22", description: "Plumbing Systems", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "Plumbing", status: "Active" },
    { code: "23 00 00", division: "23", description: "HVAC & Mechanical Systems", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "HVAC", status: "Active" },
    { code: "26 00 00", division: "26", description: "Electrical Distribution & Lighting", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "Electrical", status: "Active" },
    { code: "27 00 00", division: "27", description: "Communications & Low Voltage", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "Low Voltage", status: "Active" },
    { code: "99 99 99", division: "99", description: "Owner Contingency", costType: "Contingency", taxCategory: "Non-Taxable", budgetCategory: "Contingency", status: "Active" }
];

function getCostCodes() {
    const stored = localStorage.getItem(COST_CODES_KEY);
    if (!stored) {
        localStorage.setItem(COST_CODES_KEY, JSON.stringify(SEED_COST_CODES));
        return [...SEED_COST_CODES];
    }
    try { return JSON.parse(stored); } catch { return [...SEED_COST_CODES]; }
}

function setCostCodes(data) {
    localStorage.setItem(COST_CODES_KEY, JSON.stringify(data));
    document.dispatchEvent(new CustomEvent("cost-codes-changed"));
}

function getCurrentProjectId() {
    return localStorage.getItem("cm.selectedProject") || "RIV-104";
}

export class CostCodes {
    constructor() {
        this.searchTerm = "";
        this.currentStatus = "All";
        this.currentDivision = "All";
    }

    render() {
        const codes = getCostCodes();
        const divisions = [...new Set(codes.map(c => c.division))].sort();

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Financial Controls — Phase 1</span>
                    <h1>CSI MasterFormat Cost Codes</h1>
                    <p>Standardized cost code library. Every financial transaction must reference a valid cost code.</p>
                </div>
                <div class="toolbar">
                    <button class="button primary" id="btn-add-cost-code" type="button"><i data-lucide="plus"></i> Add Cost Code</button>
                    <button class="button" id="btn-import-csi" type="button"><i data-lucide="upload"></i> Import CSI MasterFormat</button>
                </div>
            </section>

            <div class="form-grid" style="margin-bottom: 1rem; max-width: 800px;">
                <div class="field">
                    <label>Search Cost Codes</label>
                    <div class="input-with-icon"><i data-lucide="search"></i><input class="input" id="cost-code-search" type="search" placeholder="Filter by code, description, division..."></div>
                </div>
                <div class="field">
                    <label>Status</label>
                    <select class="select" id="cost-code-status-filter">
                        <option value="All">All Statuses</option>
                        ${COST_CODE_STATUSES.map(s => `<option value="${s}">${s}</option>`).join("")}
                    </select>
                </div>
                <div class="field">
                    <label>Division</label>
                    <select class="select" id="cost-code-division-filter">
                        <option value="All">All Divisions</option>
                        ${divisions.map(d => `<option value="${d}">Division ${d}</option>`).join("")}
                    </select>
                </div>
            </div>

            ${Card.render({
                title: "Cost Code Register",
                eyebrow: `${codes.length} codes • CSI MasterFormat 2018`,
                body: `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Division</th>
                                    <th>Description</th>
                                    <th>Cost Type</th>
                                    <th>Tax Category</th>
                                    <th>Budget Category</th>
                                    <th>Status</th>
                                    <th style="text-align: right;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="cost-code-tbody">
                                ${this._renderRows(codes)}
                            </tbody>
                        </table>
                    </div>
                `
            })}
        `;
    }

    _renderRows(codes) {
        let filtered = codes;
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(c =>
                c.code.toLowerCase().includes(term) ||
                c.description.toLowerCase().includes(term) ||
                c.division.includes(term)
            );
        }
        if (this.currentStatus !== "All") filtered = filtered.filter(c => c.status === this.currentStatus);
        if (this.currentDivision !== "All") filtered = filtered.filter(c => c.division === this.currentDivision);

        return filtered.map(c => `
            <tr data-code="${c.code}">
                <td><strong class="text-primary">${c.code}</strong></td>
                <td><span class="badge neutral">Div ${c.division}</span></td>
                <td>${c.description}</td>
                <td><span class="badge neutral">${c.costType}</span></td>
                <td>${c.taxCategory}</td>
                <td>${c.budgetCategory}</td>
                <td><span class="badge ${c.status === "Active" ? "success" : "neutral"}">${c.status}</span></td>
                <td style="text-align: right;">
                    <button class="button small ghost" type="button" data-action="edit-code" data-code="${c.code}"><i data-lucide="edit-3"></i></button>
                    <button class="button small ghost danger" type="button" data-action="delete-code" data-code="${c.code}"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `).join("");
    }

    bind() {
        const main = document.getElementById("app-main");

        // Search
        document.getElementById("cost-code-search")?.addEventListener("input", (e) => {
            this.searchTerm = e.target.value;
            this._refreshTable();
        });

        document.getElementById("cost-code-status-filter")?.addEventListener("change", (e) => {
            this.currentStatus = e.target.value;
            this._refreshTable();
        });

        document.getElementById("cost-code-division-filter")?.addEventListener("change", (e) => {
            this.currentDivision = e.target.value;
            this._refreshTable();
        });

        // Add button
        document.getElementById("btn-add-cost-code")?.addEventListener("click", () => this._openAddModal());

        // Import CSI
        document.getElementById("btn-import-csi")?.addEventListener("click", () => this._importCSI());

        // Table actions
        main.querySelectorAll("[data-action='edit-code']").forEach(btn => {
            btn.addEventListener("click", () => {
                const code = getCostCodes().find(c => c.code === btn.dataset.code);
                if (code) this._openEditModal(code);
            });
        });

        main.querySelectorAll("[data-action='delete-code']").forEach(btn => {
            btn.addEventListener("click", () => {
                if (confirm(`Delete cost code ${btn.dataset.code}?`)) {
                    const all = getCostCodes().filter(c => c.code !== btn.dataset.code);
                    setCostCodes(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Cost code deleted" }));
                    this._refreshTable();
                }
            });
        });

        window.lucide?.createIcons();
    }

    _refreshTable() {
        const tbody = document.getElementById("cost-code-tbody");
        if (tbody) {
            tbody.innerHTML = this._renderRows(getCostCodes());
            this._bindActions();
            window.lucide?.createIcons();
        }
    }

    _bindActions() {
        const main = document.getElementById("app-main");
        main.querySelectorAll("[data-action='edit-code']").forEach(btn => {
            btn.addEventListener("click", () => {
                const code = getCostCodes().find(c => c.code === btn.dataset.code);
                if (code) this._openEditModal(code);
            });
        });
        main.querySelectorAll("[data-action='delete-code']").forEach(btn => {
            btn.addEventListener("click", () => {
                if (confirm(`Delete cost code ${btn.dataset.code}?`)) {
                    const all = getCostCodes().filter(c => c.code !== btn.dataset.code);
                    setCostCodes(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Cost code deleted" }));
                    this._refreshTable();
                }
            });
        });
    }

    _openAddModal() {
        const body = `
            <form id="form-add-costcode" class="record-form">
                <div class="form-grid">
                    <div class="field">
                        <label for="cc-code">CSI Cost Code *</label>
                        <input class="input" id="cc-code" name="code" required placeholder="e.g. 09 90 00" pattern="\\d{2} \\d{2} \\d{2}">
                    </div>
                    <div class="field">
                        <label for="cc-div">Division</label>
                        <input class="input" id="cc-div" name="division" placeholder="Auto-filled from code" readonly>
                    </div>
                </div>
                <div class="field">
                    <label for="cc-desc">Description *</label>
                    <input class="input" id="cc-desc" name="description" required placeholder="e.g. Painting & Coatings">
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="cc-type">Cost Type *</label>
                        <select class="select" id="cc-type" name="costType" required>
                            ${COST_TYPES.map(t => `<option value="${t}">${t}</option>`).join("")}
                        </select>
                    </div>
                    <div class="field">
                        <label for="cc-tax">Tax Category</label>
                        <select class="select" id="cc-tax" name="taxCategory">
                            <option value="Taxable">Taxable</option>
                            <option value="Non-Taxable">Non-Taxable</option>
                        </select>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="cc-budget-cat">Budget Category</label>
                        <input class="input" id="cc-budget-cat" name="budgetCategory" placeholder="e.g. Finishes">
                    </div>
                    <div class="field">
                        <label for="cc-status">Status</label>
                        <select class="select" id="cc-status" name="status">
                            ${COST_CODE_STATUSES.map(s => `<option value="${s}">${s}</option>`).join("")}
                        </select>
                    </div>
                </div>
                <div class="split" style="margin-top: 0.75rem;">
                    <span></span>
                    <button class="button primary" type="submit"><i data-lucide="check"></i> Add Cost Code</button>
                </div>
            </form>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "Add CSI Cost Code",
                body,
                onSubmit: (vals) => {
                    // Auto-fill division from code
                    const div = vals.code.substring(0, 2);
                    vals.division = div;
                    const all = getCostCodes();
                    if (all.some(c => c.code === vals.code)) {
                        document.dispatchEvent(new CustomEvent("toast", { detail: "Cost code already exists" }));
                        return false;
                    }
                    all.unshift(vals);
                    setCostCodes(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `Cost code ${vals.code} added` }));
                }
            }
        }));

        setTimeout(() => {
            const codeInput = document.getElementById("cc-code");
            const divInput = document.getElementById("cc-div");
            codeInput?.addEventListener("input", (e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val.length >= 2) divInput.value = val.substring(0, 2);
            });
            window.lucide?.createIcons();
        }, 50);
    }

    _openEditModal(code) {
        const body = `
            <form id="form-edit-costcode" class="record-form">
                <div class="field">
                    <label>Cost Code</label>
                    <input class="input" value="${code.code}" disabled>
                </div>
                <div class="field">
                    <label for="ccE-desc">Description *</label>
                    <input class="input" id="ccE-desc" name="description" value="${code.description}" required>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="ccE-type">Cost Type *</label>
                        <select class="select" id="ccE-type" name="costType" required>
                            ${COST_TYPES.map(t => `<option value="${t}"${code.costType === t ? " selected" : ""}>${t}</option>`).join("")}
                        </select>
                    </div>
                    <div class="field">
                        <label for="ccE-tax">Tax Category</label>
                        <select class="select" id="ccE-tax" name="taxCategory">
                            <option value="Taxable"${code.taxCategory === "Taxable" ? " selected" : ""}>Taxable</option>
                            <option value="Non-Taxable"${code.taxCategory === "Non-Taxable" ? " selected" : ""}>Non-Taxable</option>
                        </select>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="ccE-budget">Budget Category</label>
                        <input class="input" id="ccE-budget" name="budgetCategory" value="${code.budgetCategory}">
                    </div>
                    <div class="field">
                        <label for="ccE-status">Status</label>
                        <select class="select" id="ccE-status" name="status">
                            ${COST_CODE_STATUSES.map(s => `<option value="${s}"${code.status === s ? " selected" : ""}>${s}</option>`).join("")}
                        </select>
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
                title: `Edit ${code.code} — ${code.description}`,
                body,
                onSubmit: (vals) => {
                    const all = getCostCodes().map(c => c.code === code.code ? { ...c, ...vals } : c);
                    setCostCodes(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `${code.code} updated` }));
                }
            }
        }));

        setTimeout(() => window.lucide?.createIcons(), 50);
    }

    _importCSI() {
        // Simulate CSI MasterFormat import
        const csiCodes = [
            { code: "01 11 00", division: "01", description: "Summary of Work", costType: "General Conditions", taxCategory: "Non-Taxable", budgetCategory: "Soft Costs", status: "Active" },
            { code: "01 21 00", division: "01", description: "Allowances", costType: "Allowances", taxCategory: "Non-Taxable", budgetCategory: "Contingency", status: "Active" },
            { code: "01 22 00", division: "01", description: "Unit Prices", costType: "General Conditions", taxCategory: "Non-Taxable", budgetCategory: "Soft Costs", status: "Active" },
            { code: "01 23 00", division: "01", description: "Alternates", costType: "General Conditions", taxCategory: "Non-Taxable", budgetCategory: "Contingency", status: "Active" },
            { code: "01 25 00", division: "01", description: "Substitution Procedures", costType: "General Conditions", taxCategory: "Non-Taxable", budgetCategory: "Soft Costs", status: "Active" },
            { code: "01 26 00", division: "01", description: "Contract Modification Procedures", costType: "General Conditions", taxCategory: "Non-Taxable", budgetCategory: "Soft Costs", status: "Active" },
            { code: "01 29 00", division: "01", description: "Payment Procedures", costType: "General Conditions", taxCategory: "Non-Taxable", budgetCategory: "Soft Costs", status: "Active" },
            { code: "01 31 13", division: "01", description: "Project Coordination", costType: "General Conditions", taxCategory: "Non-Taxable", budgetCategory: "Soft Costs", status: "Active" },
            { code: "01 31 19", division: "01", description: "Project Meetings", costType: "General Conditions", taxCategory: "Non-Taxable", budgetCategory: "Soft Costs", status: "Active" },
            { code: "01 32 00", division: "01", description: "Construction Progress Documentation", costType: "General Conditions", taxCategory: "Non-Taxable", budgetCategory: "Soft Costs", status: "Active" },
            { code: "01 33 00", division: "01", description: "Submittal Procedures", costType: "General Conditions", taxCategory: "Non-Taxable", budgetCategory: "Soft Costs", status: "Active" },
            { code: "01 40 00", division: "01", description: "Quality Requirements", costType: "General Conditions", taxCategory: "Non-Taxable", budgetCategory: "Soft Costs", status: "Active" },
            { code: "01 41 00", division: "01", description: "Regulatory Requirements", costType: "General Conditions", taxCategory: "Non-Taxable", budgetCategory: "Soft Costs", status: "Active" },
            { code: "01 50 00", division: "01", description: "Temporary Facilities and Controls", costType: "General Conditions", taxCategory: "Non-Taxable", budgetCategory: "Soft Costs", status: "Active" },
            { code: "01 51 00", division: "01", description: "Temporary Utilities", costType: "General Conditions", taxCategory: "Taxable", budgetCategory: "Site Work", status: "Active" },
            { code: "01 52 00", division: "01", description: "Construction Facilities", costType: "General Conditions", taxCategory: "Taxable", budgetCategory: "Site Work", status: "Active" },
            { code: "01 54 00", division: "01", description: "Construction Aids", costType: "Equipment", taxCategory: "Taxable", budgetCategory: "Site Work", status: "Active" },
            { code: "01 55 00", division: "01", description: "Vehicular Access and Parking", costType: "General Conditions", taxCategory: "Taxable", budgetCategory: "Site Work", status: "Active" },
            { code: "01 56 00", division: "01", description: "Temporary Barriers and Enclosures", costType: "General Conditions", taxCategory: "Taxable", budgetCategory: "Site Work", status: "Active" },
            { code: "01 57 00", division: "01", description: "Temporary Controls", costType: "General Conditions", taxCategory: "Taxable", budgetCategory: "Site Work", status: "Active" },
            { code: "01 60 00", division: "01", description: "Product Requirements", costType: "General Conditions", taxCategory: "Non-Taxable", budgetCategory: "Soft Costs", status: "Active" },
            { code: "01 70 00", division: "01", description: "Execution and Closeout Requirements", costType: "General Conditions", taxCategory: "Non-Taxable", budgetCategory: "Soft Costs", status: "Active" },
        ];

        const all = getCostCodes();
        let added = 0;
        for (const c of csiCodes) {
            if (!all.some(existing => existing.code === c.code)) {
                all.unshift(c);
                added++;
            }
        }
        setCostCodes(all);
        document.dispatchEvent(new CustomEvent("toast", { detail: `Imported ${added} CSI MasterFormat codes` }));
        this._refreshTable();
    }
}