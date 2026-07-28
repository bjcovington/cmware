import { Card } from "../../components/Card.js";

const REPORT_TYPES = [
    { id: "rpt-budget-actual", icon: "bar-chart-3", title: "Budget vs Actual Summary", description: "Compare approved budget against actual costs by division and cost code." },
    { id: "rpt-commitments", icon: "file-text", title: "Commitment Register Report", description: "Summary of all subcontracts, POs, and committed costs by vendor." },
    { id: "rpt-change-log", icon: "git-branch", title: "Change Order Log", description: "Complete history of change events, PCOs, and approved change orders." },
    { id: "rpt-invoice-aging", icon: "clock", title: "Invoice Aging Report", description: "Outstanding invoices categorized by aging buckets (current, 30, 60, 90+ days)." },
    { id: "rpt-cash-flow", icon: "arrow-right-left", title: "Cash Flow Statement", description: "Monthly inflow vs outflow projections with net cash position." },
    { id: "rpt-pay-app", icon: "file-check", title: "Pay Application Summary", description: "Progress payment applications and owner approval status." },
    { id: "rpt-retention", icon: "lock", title: "Retention Status Report", description: "Retained amounts by subcontractor with release schedule." },
    { id: "rpt-cost-distribution", icon: "pie-chart", title: "Cost Code Distribution", description: "Cost distribution across CSI divisions with percentage breakdown." }
];

export class FinancialReports {
    render() {
        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Executive Reporting</span>
                    <h1>Financial Reports</h1>
                    <p>Generate standard and custom financial reports for project stakeholders.</p>
                </div>
            </section>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
                ${REPORT_TYPES.map(r => `
                    ${Card.render({
                        body: `
                            <div style="padding: 0.25rem 0;">
                                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                                    <i data-lucide="${r.icon}" style="width: 24px; height: 24px; color: var(--color-primary, #3b82f6);"></i>
                                    <h3 style="margin: 0; font-size: 1rem;">${r.title}</h3>
                                </div>
                                <p style="margin: 0 0 1rem 0; font-size: 0.85rem; color: var(--color-text-secondary, #6b7280); line-height: 1.4;">${r.description}</p>
                                <button class="button primary small" type="button" data-report="${r.id}">
                                    <i data-lucide="download"></i> Generate Report
                                </button>
                            </div>
                        `
                    })}
                `).join("")}
            </div>
        `;
    }

    bind() {
        document.querySelectorAll("[data-report]").forEach(btn => {
            btn.addEventListener("click", () => {
                document.dispatchEvent(new CustomEvent("toast", { detail: "Report generated (demo mode)" }));
            });
        });

        window.lucide?.createIcons();
    }
}
