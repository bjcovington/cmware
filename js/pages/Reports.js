import { recordStore } from "../recordStore.js";
import { Card, MetricCard } from "../components/Card.js";

export class Reports {
    render() {
        const records = recordStore.all();
        const rfis = records.filter((r) => r.module === "rfis");
        const submittals = records.filter((r) => r.module === "submittals");

        const openRfis = rfis.filter((r) => r.status !== "Closed").length;
        const openSubs = submittals.filter((r) => r.status !== "Closed").length;
        const totalCostExposure = records
            .filter((r) => ["Open", "Pricing", "Submitted", "In Review"].includes(r.status))
            .reduce((sum, r) => sum + Number(r.cost || 0), 0);

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Executive Analytics</span>
                    <h1>Project Controls Executive Reports</h1>
                    <p>Generate executive snapshots, financial exposure breakdowns, aging metrics, and printable report packages.</p>
                </div>
                <div class="toolbar">
                    <button class="button primary" onclick="window.print()" type="button"><i data-lucide="printer"></i> Print Executive Package</button>
                    <button class="button" onclick="document.dispatchEvent(new CustomEvent('toast', { detail: 'Exporting full project audit log...' }))" type="button"><i data-lucide="download"></i> Export Full Audit CSV</button>
                </div>
            </section>

            <section class="metric-grid">
                ${MetricCard.render(["Open RFI Count", openRfis, "Pending design clarification", "warn"])}
                ${MetricCard.render(["Open Submittals", openSubs, "In review workflow", "warn"])}
                ${MetricCard.render(["Pending Cost Exposure", `$${totalCostExposure.toLocaleString()}`, "Potential change events", "danger"])}
                ${MetricCard.render(["Avg RFI Turnaround", "5.8 Days", "Architect response velocity", "good"])}
            </section>

            <div class="dashboard-grid">
                ${Card.render({
                    title: "Document Controls Status Distribution",
                    eyebrow: "Module Breakdown",
                    body: `
                        <div class="table-wrap">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Module Register</th>
                                        <th>Total Records</th>
                                        <th>Open / In Review</th>
                                        <th>Approved / Closed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>RFIs</strong></td>
                                        <td>${rfis.length}</td>
                                        <td><span class="badge warning">${openRfis}</span></td>
                                        <td><span class="badge success">${rfis.length - openRfis}</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Submittals</strong></td>
                                        <td>${submittals.length}</td>
                                        <td><span class="badge warning">${openSubs}</span></td>
                                        <td><span class="badge success">${submittals.length - openSubs}</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    `
                })}

                ${Card.render({
                    title: "Printable Report Packages",
                    eyebrow: "Quick Transmittals",
                    body: `
                        <div class="stack">
                            <button class="button secondary fill" type="button" onclick="window.print()"><i data-lucide="file-spreadsheet"></i> Print Executive Cost Summary</button>
                            <button class="button secondary fill" type="button" onclick="window.print()"><i data-lucide="list-checks"></i> Print RFI Aging & Bottleneck Report</button>
                            <button class="button secondary fill" type="button" onclick="window.print()"><i data-lucide="clipboard-check"></i> Print Submittal Status Log</button>
                        </div>
                    `
                })}
            </div>
        `;
    }
}
