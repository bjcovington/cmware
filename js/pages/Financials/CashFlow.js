import { Card } from "../../components/Card.js";

function getCurrentProjectId() {
    return localStorage.getItem("cm.selectedProject") || "RIV-104";
}

function getKey() {
    return `cmware_cash_flow_${getCurrentProjectId()}`;
}

const SEED_DATA = [
    { id: "cf-001", month: "July 2026", plannedInflow: 4200000, actualInflow: 4200000, plannedOutflow: 3800000, actualOutflow: 3650000, netCashFlow: 550000 },
    { id: "cf-002", month: "August 2026", plannedInflow: 3800000, actualInflow: 0, plannedOutflow: 3500000, actualOutflow: 0, netCashFlow: 0 },
    { id: "cf-003", month: "September 2026", plannedInflow: 3200000, actualInflow: 0, plannedOutflow: 3100000, actualOutflow: 0, netCashFlow: 0 }
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

export class CashFlow {
    render() {
        const rows = getData();

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Financial Controls — Phase 5</span>
                    <h1>Cash Flow Projection</h1>
                    <p>Monthly cash flow analysis comparing planned versus actual inflows and outflows.</p>
                </div>
            </section>

            ${Card.render({
                title: "Monthly Cash Flow",
                eyebrow: `Project ${getCurrentProjectId()} • ${rows.length} months projected`,
                body: `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th style="text-align: right;">Planned In</th>
                                    <th style="text-align: right;">Actual In</th>
                                    <th style="text-align: right;">Planned Out</th>
                                    <th style="text-align: right;">Actual Out</th>
                                    <th style="text-align: right;">Net Cash Flow</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows.map(r => `
                                    <tr>
                                        <td><strong class="text-primary">${r.month}</strong></td>
                                        <td style="text-align: right;">${fmtCurrency(r.plannedInflow)}</td>
                                        <td style="text-align: right;">${fmtCurrency(r.actualInflow)}</td>
                                        <td style="text-align: right;">${fmtCurrency(r.plannedOutflow)}</td>
                                        <td style="text-align: right;">${fmtCurrency(r.actualOutflow)}</td>
                                        <td style="text-align: right; color: ${r.netCashFlow < 0 ? "var(--color-danger, #e74c3c)" : "var(--color-success, #27ae60)"};">${fmtCurrency(r.netCashFlow)}</td>
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
