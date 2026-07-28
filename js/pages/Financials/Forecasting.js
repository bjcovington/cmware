import { Card } from "../../components/Card.js";

function getCurrentProjectId() {
    return localStorage.getItem("cm.selectedProject") || "RIV-104";
}

function getKey() {
    return `cmware_forecast_${getCurrentProjectId()}`;
}

const SEED_DATA = [
    { id: "fc-001", category: "Final Cost", budgetAmount: 48250000, forecastAmount: 49100000, variance: -850000, variancePercent: -1.76, notes: "Pending PCO-002 resolution" },
    { id: "fc-002", category: "Final Revenue", budgetAmount: 52000000, forecastAmount: 52000000, variance: 0, variancePercent: 0, notes: "Owner contract value unchanged" },
    { id: "fc-003", category: "Final Profit", budgetAmount: 3750000, forecastAmount: 2900000, variance: -850000, variancePercent: -22.67, notes: "Margin erosion from change order exposure" },
    { id: "fc-004", category: "Remaining Cost", budgetAmount: 22400000, forecastAmount: 23250000, variance: -850000, variancePercent: -3.79, notes: "Includes pending PCOs and potential risks" }
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
}

function fmtCurrency(val) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(val);
}

function fmtPercent(val) {
    return val.toFixed(2) + "%";
}

export class Forecasting {
    render() {
        const rows = getData();

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Financial Controls — Phase 5</span>
                    <h1>Cost & Revenue Forecasting</h1>
                    <p>At-completion forecast analysis comparing budgeted amounts to projected final values.</p>
                </div>
            </section>

            ${Card.render({
                title: "Forecast Summary",
                eyebrow: `Project ${getCurrentProjectId()} • ${rows.length} line items`,
                body: `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th style="text-align: right;">Budget</th>
                                    <th style="text-align: right;">Forecast</th>
                                    <th style="text-align: right;">Variance ($)</th>
                                    <th style="text-align: right;">Variance (%)</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows.map(r => `
                                    <tr>
                                        <td><strong class="text-primary">${r.category}</strong></td>
                                        <td style="text-align: right;">${fmtCurrency(r.budgetAmount)}</td>
                                        <td style="text-align: right;">${fmtCurrency(r.forecastAmount)}</td>
                                        <td style="text-align: right; color: ${r.variance < 0 ? "var(--color-danger, #e74c3c)" : "inherit"};">${fmtCurrency(r.variance)}</td>
                                        <td style="text-align: right; color: ${r.variancePercent < 0 ? "var(--color-danger, #e74c3c)" : "inherit"};">${fmtPercent(r.variancePercent)}</td>
                                        <td>${r.notes}</td>
                                    </tr>
                                `).join("")}
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
