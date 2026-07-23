import { activity, deadlines } from "../database.js";
import { recordStore } from "../recordStore.js";
import { Button } from "../components/Button.js";
import { Card, MetricCard } from "../components/Card.js";

export class Dashboard {
    render() {
        const metrics = this.metrics();
        return `
            <section class="project-hero">
                <div class="stack">
                    <span class="eyebrow">Riverside Medical Center</span>
                    <h1>Command center for project cost, quality, and schedule.</h1>
                    <p>Track document control, field coordination, change exposure, and executive health from one focused workspace.</p>
                    <div class="cluster">
                        ${Button.render({ label: "Create RFI", icon: "message-square-plus", variant: "primary" })}
                        ${Button.render({ label: "Upload Document", icon: "upload" })}
                    </div>
                </div>
                <aside class="health-panel">
                    <div class="split"><strong>Project Health</strong><span class="badge success">On Track</span></div>
                    <div class="progress-ring" data-label="84%" style="--value:84"></div>
                    <p>Schedule variance, response times, and cost exposure are within the current control thresholds.</p>
                </aside>
            </section>
            <section class="metric-grid">${metrics.map((metric) => MetricCard.render(metric)).join("")}</section>
            <section class="dashboard-grid">
                ${Card.render({ title: "Recent Activity", eyebrow: "Timeline", body: this.activity() })}
                <div class="stack">
                    ${Card.render({ title: "Upcoming Deadlines", body: this.deadlines() })}
                    ${Card.render({ title: "Commitment Trend", eyebrow: "Chart", body: this.chart() })}
                    ${Card.render({ title: "Weather", body: `<div class="weather-panel"><div class="split"><strong>78F and clear</strong><span class="badge info">Low wind</span></div><p>Good conditions for exterior envelope work.</p></div>` })}
                </div>
            </section>
        `;
    }

    activity() {
        return `<div class="timeline">${activity.map(([title, text, time]) => `<article class="timeline-item"><span class="timeline-dot"><i data-lucide="clock-3"></i></span><div><div class="split"><strong>${title}</strong><span class="muted">${time}</span></div><p>${text}</p></div></article>`).join("")}</div>`;
    }

    deadlines() {
        return `<div class="deadline-list">${deadlines.map(([title, due, tone]) => `<div class="deadline-item"><strong>${title}</strong><span class="badge ${tone}">${due}</span></div>`).join("")}</div>`;
    }

    chart() {
        const bars = [44, 58, 42, 76, 63, 94, 71, 82, 66, 88];
        return `<div class="chart-placeholder" aria-label="Placeholder bar chart">${bars.map((bar) => `<span style="height:${bar}%"></span>`).join("")}</div>`;
    }

    metrics() {
        const records = recordStore.all();
        const rfis = records.filter((record) => record.module === "rfis");
        const submittals = records.filter((record) => record.module === "submittals");
        const changes = records.filter((record) => ["change-events", "change-orders", "proposal-requests", "ccds"].includes(record.module));
        const approvedCost = records
            .filter((record) => record.status === "Approved")
            .reduce((total, record) => total + Number(record.cost || 0), 0);
        const pendingCost = records
            .filter((record) => ["Open", "Pricing", "Submitted", "In Review"].includes(record.status))
            .reduce((total, record) => total + Number(record.cost || 0), 0);

        return [
            ["Open RFIs", rfis.filter((record) => record.status !== "Closed").length, "Active questions", "warn"],
            ["Closed RFIs", rfis.filter((record) => record.status === "Closed").length, "Resolved items", "good"],
            ["Open Submittals", submittals.filter((record) => record.status !== "Closed").length, "In workflow", "warn"],
            ["Returned Submittals", submittals.filter((record) => record.status === "Revise and Resubmit").length, "Need resubmission", "bad"],
            ["Pending Changes", changes.filter((record) => record.status !== "Approved" && record.status !== "Closed").length, "Needs action", "warn"],
            ["Approved CO Value", this.money(approvedCost), "Approved impacts", "good"],
            ["Pending CO Value", this.money(pendingCost), "Potential exposure", "warn"],
            ["Engineer Response", "6.2d", "Avg RFI response", "good"],
            ["Submittal Review", "8.5d", "Avg review cycle", "warn"],
            ["Contract Value", "$48.25M", "Base plus approved", "neutral"],
            ["Budget Remaining", "$6.7M", "14% available", "good"]
        ];
    }

    money(value) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
            notation: value >= 1000000 ? "compact" : "standard"
        }).format(value);
    }
}
