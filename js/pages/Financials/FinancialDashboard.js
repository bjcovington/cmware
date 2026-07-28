import { Card } from "../../components/Card.js";

function getCurrentProjectId() {
    return localStorage.getItem("cm.selectedProject") || "RIV-104";
}

const BUDGET_SEED = [
    { costCode: "01 31 00", description: "Project Management & Field Supervision", originalBudget: 2400000, revisedBudget: 2445000, commitments: 2400000, pendingExposure: 15000, remainingBalance: 30000 },
    { costCode: "03 30 00", description: "Cast-in-Place Concrete & Reinforcing", originalBudget: 8600000, revisedBudget: 8784000, commitments: 8650000, pendingExposure: 64000, remainingBalance: 70000 },
    { costCode: "07 42 13", description: "Insulated Metal Panels & Envelope", originalBudget: 4200000, revisedBudget: 4200000, commitments: 4150000, pendingExposure: 84200, remainingBalance: -34200 },
    { costCode: "26 00 00", description: "Electrical Distribution & Lighting", originalBudget: 6800000, revisedBudget: 6828500, commitments: 6750000, pendingExposure: 28500, remainingBalance: 50000 }
];

function getBudgetData() {
    const key = `cmware_budget_${getCurrentProjectId()}`;
    const stored = localStorage.getItem(key);
    if (!stored) return BUDGET_SEED;
    try { return JSON.parse(stored); } catch { return BUDGET_SEED; }
}

function fmtCurrency(v) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}

function sum(arr, field) {
    return arr.reduce((acc, r) => acc + (r[field] || 0), 0);
}

export class FinancialDashboard {
    render() {
        const data = getBudgetData();
        const totalBudget = sum(data, "revisedBudget");
        const totalCommitted = sum(data, "commitments");
        const totalPending = sum(data, "pendingExposure");
        const totalRemaining = sum(data, "remainingBalance");

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Financial Controls</span>
                    <h1>Financial Dashboard</h1>
                    <p>High-level project financial overview with budget performance metrics.</p>
                </div>
            </section>

            <div class="metric-grid">
                ${Card.render({ body: `
                    <section class="card metric-card">
                        <span class="eyebrow">Total Budget</span>
                        <strong class="metric-value">${fmtCurrency(totalBudget)}</strong>
                        <span class="metric-trend neutral"><i data-lucide="activity"></i>${data.length} line items</span>
                    </section>
                ` })}
                ${Card.render({ body: `
                    <section class="card metric-card">
                        <span class="eyebrow">Total Committed</span>
                        <strong class="metric-value">${fmtCurrency(totalCommitted)}</strong>
                        <span class="metric-trend ${totalCommitted > totalBudget ? 'danger' : 'neutral'}"><i data-lucide="activity"></i>${((totalCommitted / totalBudget) * 100).toFixed(1)}% of budget</span>
                    </section>
                ` })}
                ${Card.render({ body: `
                    <section class="card metric-card">
                        <span class="eyebrow">Pending Exposure</span>
                        <strong class="metric-value">${fmtCurrency(totalPending)}</strong>
                        <span class="metric-trend warning"><i data-lucide="activity"></i>At risk</span>
                    </section>
                ` })}
                ${Card.render({ body: `
                    <section class="card metric-card">
                        <span class="eyebrow">Remaining Balance</span>
                        <strong class="metric-value">${fmtCurrency(totalRemaining)}</strong>
                        <span class="metric-trend ${totalRemaining < 0 ? 'danger' : 'success'}"><i data-lucide="activity"></i>${totalRemaining < 0 ? 'Over budget' : 'Under budget'}</span>
                    </section>
                ` })}
            </div>

            ${Card.render({
                title: "Budget Summary",
                eyebrow: "Cost code breakdown",
                body: `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Cost Code</th>
                                    <th>Description</th>
                                    <th style="text-align: right;">Revised Budget</th>
                                    <th style="text-align: right;">Committed</th>
                                    <th style="text-align: right;">Pending</th>
                                    <th style="text-align: right;">Remaining</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.map(r => `
                                    <tr>
                                        <td><strong class="text-primary">${r.costCode}</strong></td>
                                        <td>${r.description}</td>
                                        <td style="text-align: right;">${fmtCurrency(r.revisedBudget)}</td>
                                        <td style="text-align: right;">${fmtCurrency(r.commitments)}</td>
                                        <td style="text-align: right;">${fmtCurrency(r.pendingExposure)}</td>
                                        <td style="text-align: right; color: ${r.remainingBalance < 0 ? 'var(--color-danger)' : 'var(--color-success)'};">${fmtCurrency(r.remainingBalance)}</td>
                                    </tr>
                                `).join("")}
                                <tr class="total-row">
                                    <td><strong>TOTALS</strong></td>
                                    <td></td>
                                    <td style="text-align: right;"><strong>${fmtCurrency(totalBudget)}</strong></td>
                                    <td style="text-align: right;"><strong>${fmtCurrency(totalCommitted)}</strong></td>
                                    <td style="text-align: right;"><strong>${fmtCurrency(totalPending)}</strong></td>
                                    <td style="text-align: right;"><strong>${fmtCurrency(totalRemaining)}</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `
            })}
        `;
    }

    bind() {
        window.lucide?.createIcons();
    }
}
