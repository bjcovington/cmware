import { STATUS_BADGES } from "../constants.js";

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export class Table {
    static render({ columns, rows, actions = true }) {
        return `
            <div class="table-wrap">
                <table class="data-table">
                    <thead>
                        <tr>
                            ${columns.map((column) => `<th>${column}</th>`).join("")}
                            ${actions ? `<th style="text-align: right;">Actions</th>` : ""}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.length ? rows.map((row) => `
                            <tr class="clickable-row" data-record-id="${escapeHtml(row.id)}">
                                <td>
                                    <div class="cluster compact">
                                        <strong class="text-primary">${escapeHtml(row.number)}</strong>
                                        ${row.attachments && row.attachments.length ? `<span class="badge compact neutral" title="${row.attachments.length} attachments"><i data-lucide="paperclip"></i> ${row.attachments.length}</span>` : ""}
                                    </div>
                                </td>
                                <td>
                                    <div class="table-title-cell">
                                        <span class="cell-title">${escapeHtml(row.title)}</span>
                                        ${row.type ? `<span class="badge compact info">${escapeHtml(row.type)}</span>` : ""}
                                        ${row.specSection ? `<span class="cell-subtext">${escapeHtml(row.specSection)}</span>` : ""}
                                    </div>
                                </td>
                                <td><span class="badge ${STATUS_BADGES[row.status] || "neutral"}">${escapeHtml(row.status)}</span></td>
                                <td>${escapeHtml(row.ballInCourt || row.assignedTo || "Unassigned")}</td>
                                <td>${escapeHtml(row.due || "Unscheduled")}</td>
                                ${actions ? `
                                    <td style="text-align: right;" onclick="event.stopPropagation()">
                                        <div class="row-actions" style="justify-content: flex-end;">
                                            <button class="icon-button" type="button" data-action="view" data-record-id="${escapeHtml(row.id)}" aria-label="View Details" title="View Details"><i data-lucide="file-text"></i></button>
                                            <button class="icon-button" type="button" data-action="print" data-record-id="${escapeHtml(row.id)}" aria-label="Print PDF" title="Print PDF"><i data-lucide="printer"></i></button>
                                            <button class="icon-button" type="button" data-action="advance" data-record-id="${escapeHtml(row.id)}" aria-label="Advance status" title="Advance status"><i data-lucide="check-check"></i></button>
                                            <button class="icon-button danger" type="button" data-action="delete" data-record-id="${escapeHtml(row.id)}" aria-label="Delete record" title="Delete record"><i data-lucide="trash-2"></i></button>
                                        </div>
                                    </td>
                                ` : ""}
                            </tr>
                        `).join("") : `<tr><td colspan="${columns.length + (actions ? 1 : 0)}"><div class="empty-inline">No records found. Create a new entry above.</div></td></tr>`}
                    </tbody>
                </table>
            </div>
        `;
    }
}
