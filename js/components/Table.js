import { STATUS_BADGES } from "../constants.js";

export class Table {
    static render({ columns, rows, actions = false }) {
        return `
            <div class="table-wrap">
                <table class="data-table">
                    <thead><tr>${columns.map((column) => `<th>${column}</th>`).join("")}${actions ? "<th>Actions</th>" : ""}</tr></thead>
                    <tbody>
                        ${rows.length ? rows.map((row) => `
                            <tr>
                                <td><strong>${row.number}</strong></td>
                                <td>${row.title}</td>
                                <td><span class="badge ${STATUS_BADGES[row.status] || "neutral"}">${row.status}</span></td>
                                <td>${row.ballInCourt}</td>
                                <td>${row.due}</td>
                                ${actions ? `
                                    <td>
                                        <div class="row-actions">
                                            <button class="icon-button" type="button" data-action="advance" data-record-id="${row.id}" aria-label="Advance status" title="Advance status"><i data-lucide="check-check"></i></button>
                                            <button class="icon-button" type="button" data-action="delete" data-record-id="${row.id}" aria-label="Delete record" title="Delete record"><i data-lucide="trash-2"></i></button>
                                        </div>
                                    </td>
                                ` : ""}
                            </tr>
                        `).join("") : `<tr><td colspan="${columns.length + (actions ? 1 : 0)}"><div class="empty-inline">No records yet. Create the first one.</div></td></tr>`}
                    </tbody>
                </table>
            </div>
        `;
    }
}
