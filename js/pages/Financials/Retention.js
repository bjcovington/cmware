import { Card } from "../../components/Card.js";

function getCurrentProjectId() {
    return localStorage.getItem("cm.selectedProject") || "RIV-104";
}

function getKey() {
    return `cmware_retention_${getCurrentProjectId()}`;
}

const SEED_DATA = [
    { id: "ret-001", subcontractor: "Hardrock Concrete LLC", totalBilled: 8420000, retentionRate: 10, retentionHeld: 842000, retentionReleased: 0, netDue: 7578000 },
    { id: "ret-002", subcontractor: "Exterior Concepts LLC", totalBilled: 3800000, retentionRate: 10, retentionHeld: 380000, retentionReleased: 0, netDue: 3420000 }
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
    document.dispatchEvent(new CustomEvent("retention-changed"));
}

function formatCurrency(val) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
}

export class Retention {
    constructor() {
        this.searchTerm = "";
    }

    render() {
        const rows = getData();

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Financial Controls — Phase 4</span>
                    <h1>Retention Management</h1>
                </div>
                <div class="toolbar">
                    <button class="button primary" id="btn-add-retention" type="button"><i data-lucide="plus"></i> Add Subcontractor</button>
                </div>
            </section>

            <div class="form-grid" style="margin-bottom: 1rem; max-width: 400px;">
                <div class="field">
                    <label>Search</label>
                    <div class="input-with-icon"><i data-lucide="search"></i><input class="input" id="ret-search" type="search" placeholder="Filter by subcontractor..."></div>
                </div>
            </div>

            ${Card.render({
                title: "Retention Register",
                eyebrow: `${rows.length} subcontractors`,
                body: `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Subcontractor</th>
                                    <th style="text-align: right;">Total Billed</th>
                                    <th style="text-align: right;">Rate (%)</th>
                                    <th style="text-align: right;">Retention Held</th>
                                    <th style="text-align: right;">Released</th>
                                    <th style="text-align: right;">Net Due</th>
                                    <th style="text-align: right;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="ret-tbody">
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
                r.subcontractor.toLowerCase().includes(term)
            );
        }

        return filtered.map(r => `
            <tr data-id="${r.id}">
                <td><strong class="text-primary">${r.subcontractor}</strong></td>
                <td style="text-align: right;">${formatCurrency(r.totalBilled)}</td>
                <td style="text-align: right;">${r.retentionRate}%</td>
                <td style="text-align: right;">${formatCurrency(r.retentionHeld)}</td>
                <td style="text-align: right;">${formatCurrency(r.retentionReleased)}</td>
                <td style="text-align: right;"><strong>${formatCurrency(r.netDue)}</strong></td>
                <td style="text-align: right;">
                    <button class="button small ghost" type="button" data-action="edit-ret" data-id="${r.id}"><i data-lucide="edit-3"></i></button>
                    <button class="button small ghost danger" type="button" data-action="delete-ret" data-id="${r.id}"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `).join("");
    }

    bind() {
        document.getElementById("ret-search")?.addEventListener("input", (e) => {
            this.searchTerm = e.target.value;
            this._refreshTable();
        });

        document.getElementById("btn-add-retention")?.addEventListener("click", () => this._openAddModal());

        this._bindActions();
        window.lucide?.createIcons();
    }

    _refreshTable() {
        const tbody = document.getElementById("ret-tbody");
        if (tbody) {
            tbody.innerHTML = this._renderRows(getData());
            this._bindActions();
            window.lucide?.createIcons();
        }
    }

    _bindActions() {
        document.querySelectorAll("[data-action='edit-ret']").forEach(btn => {
            btn.addEventListener("click", () => {
                const item = getData().find(r => r.id === btn.dataset.id);
                if (item) this._openEditModal(item);
            });
        });

        document.querySelectorAll("[data-action='delete-ret']").forEach(btn => {
            btn.addEventListener("click", () => {
                if (confirm(`Delete retention record for ${btn.dataset.id}?`)) {
                    const all = getData().filter(r => r.id !== btn.dataset.id);
                    setData(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Retention record deleted" }));
                    this._refreshTable();
                }
            });
        });
    }

    _openAddModal() {
        const body = `
            <form id="form-add-retention" class="record-form">
                <div class="field">
                    <label for="ret-sub">Subcontractor *</label>
                    <input class="input" id="ret-sub" name="subcontractor" required placeholder="e.g. Hardrock Concrete LLC">
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="ret-billed">Total Billed ($) *</label>
                        <input class="input" id="ret-billed" name="totalBilled" type="number" min="0" required placeholder="0">
                    </div>
                    <div class="field">
                        <label for="ret-rate">Retention Rate (%) *</label>
                        <input class="input" id="ret-rate" name="retentionRate" type="number" min="0" max="100" required placeholder="10">
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="ret-held">Retention Held ($)</label>
                        <input class="input" id="ret-held" name="retentionHeld" type="number" min="0" placeholder="0">
                    </div>
                    <div class="field">
                        <label for="ret-released">Retention Released ($)</label>
                        <input class="input" id="ret-released" name="retentionReleased" type="number" min="0" placeholder="0">
                    </div>
                </div>
                <div class="field">
                    <label for="ret-net">Net Due ($)</label>
                    <input class="input" id="ret-net" name="netDue" type="number" min="0" placeholder="0">
                </div>
                <div class="split" style="margin-top: 0.75rem;">
                    <span></span>
                    <button class="button primary" type="submit"><i data-lucide="check"></i> Add Subcontractor</button>
                </div>
            </form>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "Add Retention Record",
                body,
                onSubmit: (vals) => {
                    vals.id = "ret-" + Date.now();
                    vals.totalBilled = Number(vals.totalBilled) || 0;
                    vals.retentionRate = Number(vals.retentionRate) || 0;
                    vals.retentionHeld = Number(vals.retentionHeld) || 0;
                    vals.retentionReleased = Number(vals.retentionReleased) || 0;
                    vals.netDue = Number(vals.netDue) || 0;
                    const all = getData();
                    all.unshift(vals);
                    setData(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `Retention record for ${vals.subcontractor} added` }));
                }
            }
        }));

        setTimeout(() => window.lucide?.createIcons(), 50);
    }

    _openEditModal(item) {
        const body = `
            <form id="form-edit-retention" class="record-form">
                <div class="field">
                    <label>Subcontractor</label>
                    <input class="input" value="${item.subcontractor}" disabled>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="retE-billed">Total Billed ($) *</label>
                        <input class="input" id="retE-billed" name="totalBilled" type="number" min="0" value="${item.totalBilled}" required>
                    </div>
                    <div class="field">
                        <label for="retE-rate">Retention Rate (%) *</label>
                        <input class="input" id="retE-rate" name="retentionRate" type="number" min="0" max="100" value="${item.retentionRate}" required>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="retE-held">Retention Held ($)</label>
                        <input class="input" id="retE-held" name="retentionHeld" type="number" min="0" value="${item.retentionHeld}">
                    </div>
                    <div class="field">
                        <label for="retE-released">Retention Released ($)</label>
                        <input class="input" id="retE-released" name="retentionReleased" type="number" min="0" value="${item.retentionReleased}">
                    </div>
                </div>
                <div class="field">
                    <label for="retE-net">Net Due ($)</label>
                    <input class="input" id="retE-net" name="netDue" type="number" min="0" value="${item.netDue}">
                </div>
                <div class="split" style="margin-top: 0.75rem;">
                    <span></span>
                    <button class="button primary" type="submit"><i data-lucide="save"></i> Save Changes</button>
                </div>
            </form>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: `Edit Retention — ${item.subcontractor}`,
                body,
                onSubmit: (vals) => {
                    vals.totalBilled = Number(vals.totalBilled) || 0;
                    vals.retentionRate = Number(vals.retentionRate) || 0;
                    vals.retentionHeld = Number(vals.retentionHeld) || 0;
                    vals.retentionReleased = Number(vals.retentionReleased) || 0;
                    vals.netDue = Number(vals.netDue) || 0;
                    const all = getData().map(r => r.id === item.id ? { ...r, ...vals } : r);
                    setData(all);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `Retention for ${item.subcontractor} updated` }));
                }
            }
        }));

        setTimeout(() => window.lucide?.createIcons(), 50);
    }
}
