import { Card } from "../../components/Card.js";

function getCurrentProjectId() {
    return localStorage.getItem("cm.selectedProject") || "RIV-104";
}

function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}

function fmtCurrency(val) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(val);
}

function getTotalBudget() {
    const forecast = readJson(`cmware_forecast_${getCurrentProjectId()}`, []);
    const costCodes = readJson("cmware_cost_codes", []);
    const fromForecast = forecast.reduce((sum, r) => sum + (r.budgetAmount || 0), 0);
    if (fromForecast > 0) return fromForecast;
    return 48250000;
}

function getTotalCommitted() {
    const commitments = readJson(`cmware_commitments_${getCurrentProjectId()}`, []);
    return commitments.reduce((sum, c) => sum + (c.amount || 0), 0) || 26750000;
}

function getOutstandingPCOs() {
    const changeEvents = readJson(`cmware_change_events_${getCurrentProjectId()}`, []);
    if (changeEvents.length > 0) {
        return changeEvents.filter(e => e.status === "Open" || e.status === "Pending").length;
    }
    return 4;
}

function getPendingInvoices() {
    const invoices = readJson(`cmware_invoices_${getCurrentProjectId()}`, []);
    if (invoices.length > 0) {
        return invoices.filter(i => i.status === "Pending" || i.status === "Submitted").length;
    }
    return 7;
}

function getHealthStatus() {
    const forecast = readJson(`cmware_forecast_${getCurrentProjectId()}`, []);
    if (forecast.length > 0) {
        const totalBudget = forecast.reduce((s, r) => s + (r.budgetAmount || 0), 0);
        const totalForecast = forecast.reduce((s, r) => s + (r.forecastAmount || 0), 0);
        if (totalBudget === 0) return "green";
        const variance = ((totalForecast - totalBudget) / totalBudget) * 100;
        if (variance <= -5) return "red";
        if (variance <= 0) return "yellow";
        return "green";
    }
    return "yellow";
}

const HEALTH_CONFIG = {
    green: { label: "On Track", icon: "check-circle", color: "var(--color-success, #27ae60)", desc: "Project financials are within acceptable variance thresholds." },
    yellow: { label: "At Risk", icon: "alert-triangle", color: "var(--color-warning, #f59e0b)", desc: "Project is showing early signs of budget pressure. Monitor closely." },
    red: { label: "Critical", icon: "x-circle", color: "var(--color-danger, #e74c3c)", desc: "Significant budget variance detected. Immediate action recommended." }
};

export class ExecutiveDashboard {
    render() {
        const projectId = getCurrentProjectId();
        const totalBudget = getTotalBudget();
        const totalCommitted = getTotalCommitted();
        const outstandingPCOs = getOutstandingPCOs();
        const pendingInvoices = getPendingInvoices();
        const health = getHealthStatus();
        const cfg = HEALTH_CONFIG[health];

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Executive Controls</span>
                    <h1>Executive Dashboard</h1>
                    <p>High-level financial overview for project ${projectId}.</p>
                </div>
            </section>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                ${Card.render({
                    body: `
                        <div style="padding: 0.25rem 0;">
                            <span class="eyebrow">Total Budget</span>
                            <strong class="metric-value" style="font-size: 1.5rem;">${fmtCurrency(totalBudget)}</strong>
                            <span style="font-size: 0.8rem; color: var(--color-text-secondary, #6b7280);">Approved contract value</span>
                        </div>
                    `
                })}
                ${Card.render({
                    body: `
                        <div style="padding: 0.25rem 0;">
                            <span class="eyebrow">Total Committed</span>
                            <strong class="metric-value" style="font-size: 1.5rem;">${fmtCurrency(totalCommitted)}</strong>
                            <span style="font-size: 0.8rem; color: var(--color-text-secondary, #6b7280);">Subcontracts + purchase orders</span>
                        </div>
                    `
                })}
                ${Card.render({
                    body: `
                        <div style="padding: 0.25rem 0;">
                            <span class="eyebrow">Outstanding PCOs</span>
                            <strong class="metric-value" style="font-size: 1.5rem;">${outstandingPCOs}</strong>
                            <span style="font-size: 0.8rem; color: var(--color-text-secondary, #6b7280);">Pending owner change orders</span>
                        </div>
                    `
                })}
                ${Card.render({
                    body: `
                        <div style="padding: 0.25rem 0;">
                            <span class="eyebrow">Pending Invoices</span>
                            <strong class="metric-value" style="font-size: 1.5rem;">${pendingInvoices}</strong>
                            <span style="font-size: 0.8rem; color: var(--color-text-secondary, #6b7280);">Awaiting processing or approval</span>
                        </div>
                    `
                })}
            </div>

            ${Card.render({
                title: "Project Health",
                eyebrow: `Overall status: ${cfg.label}`,
                body: `
                    <div style="padding: 1rem 0; display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: ${cfg.color}; display: flex; align-items: center; justify-content: center;">
                            <i data-lucide="${cfg.icon}" style="width: 24px; height: 24px; color: #fff;"></i>
                        </div>
                        <div>
                            <h3 style="margin: 0; color: ${cfg.color};">${cfg.label}</h3>
                            <p style="margin: 0.25rem 0 0 0; font-size: 0.9rem; color: var(--color-text-secondary, #6b7280);">${cfg.desc}</p>
                        </div>
                    </div>
                `
            })}
        `;
    }

    bind() {
        window.lucide?.createIcons();
    }
}
