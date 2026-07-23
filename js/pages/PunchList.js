import { recordStore } from "../recordStore.js";
import { Card } from "../components/Card.js";
import { Button } from "../components/Button.js";

export class PunchList {
    render() {
        const items = recordStore.getPunchList();

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Quality & Field Inspections</span>
                    <h1>Punch List & Quality Controls</h1>
                    <p>Track field deficiencies, room-by-room completion items, assigned trades, and inspection sign-offs.</p>
                </div>
                <div class="toolbar">
                    <button class="button primary" id="btn-add-punch-item" type="button"><i data-lucide="plus"></i> Add Punch Item</button>
                    <button class="button" onclick="window.print()" type="button"><i data-lucide="printer"></i> Print Inspection Report</button>
                </div>
            </section>

            ${Card.render({
                title: "Punch List Items",
                eyebrow: "Field Quality Log",
                body: `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Item #</th>
                                    <th>Title & Location</th>
                                    <th>Assigned Trade</th>
                                    <th>Assignee</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items.map((item) => `
                                    <tr class="clickable-row">
                                        <td><strong>${item.number}</strong></td>
                                        <td>
                                            <div class="table-title-cell">
                                                <span class="cell-title">${item.title}</span>
                                                <span class="cell-subtext"><i data-lucide="map-pin"></i> ${item.location}</span>
                                            </div>
                                        </td>
                                        <td><span class="badge info">${item.assignedTrade}</span></td>
                                        <td>${item.assignedPerson}</td>
                                        <td>${item.dueDate}</td>
                                        <td><span class="badge ${item.status === 'Open' ? 'warning' : 'success'}">${item.status}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `
            })}
        `;
    }

    bind() {
        document.getElementById("btn-add-punch-item")?.addEventListener("click", () => {
            const body = `
                <form id="form-add-punch" class="record-form">
                    <div class="field">
                        <label for="pnch-title">Deficiency Title</label>
                        <input class="input" id="pnch-title" name="title" required placeholder="e.g. Room 302 Ceiling Tile Alignment">
                    </div>
                    <div class="form-grid">
                        <div class="field">
                            <label for="pnch-location">Location / Room #</label>
                            <input class="input" id="pnch-location" name="location" required placeholder="e.g. Level 03 ICU Room 302">
                        </div>
                        <div class="field">
                            <label for="pnch-trade">Assigned Trade</label>
                            <input class="input" id="pnch-trade" name="assignedTrade" required placeholder="e.g. Volt Electric / Drywall">
                        </div>
                    </div>
                    <div class="form-grid">
                        <div class="field">
                            <label for="pnch-person">Assigned Person</label>
                            <input class="input" id="pnch-person" name="assignedPerson" placeholder="e.g. Carlos Rodriguez">
                        </div>
                        <div class="field">
                            <label for="pnch-due">Due Date</label>
                            <input class="input" id="pnch-due" name="dueDate" type="date" value="${new Date().toISOString().split('T')[0]}">
                        </div>
                    </div>
                    <div class="field">
                        <label for="pnch-desc">Inspection Notes & Details</label>
                        <textarea class="textarea" id="pnch-desc" name="description" placeholder="Describe corrective action required..."></textarea>
                    </div>
                    <div class="split">
                        <span></span>
                        <button class="button primary" type="submit"><i data-lucide="check"></i> Create Punch Item</button>
                    </div>
                </form>
            `;

            document.dispatchEvent(new CustomEvent("open-modal", {
                detail: {
                    title: "Add Field Punch Item",
                    body,
                    onSubmit: (values) => {
                        recordStore.addPunchItem(values);
                        document.dispatchEvent(new CustomEvent("toast", { detail: "Punch item added" }));
                        location.hash = "#/logs";
                    }
                }
            }));
        });
    }
}
