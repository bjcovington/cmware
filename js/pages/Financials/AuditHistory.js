import { Card } from "../../components/Card.js";

function getCurrentProjectId() {
    return localStorage.getItem("cm.selectedProject") || "RIV-104";
}

function getKey() {
    return `cmware_audit_trail_${getCurrentProjectId()}`;
}

const SEED_DATA = [
    { id: "aud-001", timestamp: "2026-07-25T14:30:00", user: "Marcus Vance", action: "Created", module: "Pay Application", detail: "PA-001 submitted for July 2026" },
    { id: "aud-002", timestamp: "2026-07-20T09:15:00", user: "Marcus Vance", action: "Updated", module: "Change Event", detail: "CE-0034 status changed to Open" },
    { id: "aud-003", timestamp: "2026-07-18T16:45:00", user: "Carlos Rodriguez", action: "Created", module: "Purchase Order", detail: "PO-002 created for temporary power" },
    { id: "aud-004", timestamp: "2026-07-15T11:00:00", user: "Marcus Vance", action: "Approved", module: "Subcontract", detail: "S-001 executed with Hardrock Concrete" }
];

function getData() {
    const stored = localStorage.getItem(getKey());
    if (!stored) {
        localStorage.setItem(getKey(), JSON.stringify(SEED_DATA));
        return [...SEED_DATA];
    }
    try { return JSON.parse(stored); } catch { return [...SEED_DATA]; }
}

function formatTimestamp(ts) {
    const d = new Date(ts);
    const date = d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return `${date} ${time}`;
}

function actionBadgeClass(action) {
    switch (action) {
        case "Created": return "badge success";
        case "Updated": return "badge neutral";
        case "Approved": return "badge primary";
        default: return "badge neutral";
    }
}

export class AuditHistory {
    render() {
        const rows = [...getData()].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Executive Reporting</span>
                    <h1>Audit History</h1>
                    <p>Complete audit trail of financial system activity and record changes.</p>
                </div>
            </section>

            ${Card.render({
                title: "Audit Trail",
                eyebrow: `Project ${getCurrentProjectId()} • ${rows.length} entries`,
                body: `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Module</th>
                                    <th>Detail</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows.map(r => `
                                    <tr>
                                        <td style="white-space: nowrap; color: var(--color-text-secondary, #6b7280);">${formatTimestamp(r.timestamp)}</td>
                                        <td>${r.user}</td>
                                        <td><span class="${actionBadgeClass(r.action)}">${r.action}</span></td>
                                        <td>${r.module}</td>
                                        <td>${r.detail}</td>
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
