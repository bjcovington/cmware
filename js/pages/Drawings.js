import { recordStore } from "../recordStore.js";
import { Card } from "../components/Card.js";
import { Button } from "../components/Button.js";

export class Drawings {
    render() {
        const dwgs = recordStore.getDrawings();

        const disciplines = ["All", "Architectural", "Structural", "Mechanical", "Electrical"];

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Document Control</span>
                    <h1>Drawing Sheet & Specification Register</h1>
                    <p>Current construction drawing revisions, contract drawing sheets, and spec section index.</p>
                </div>
                <div class="toolbar">
                    <button class="button primary" id="btn-add-drawing-sheet" type="button"><i data-lucide="plus"></i> Add Drawing Sheet</button>
                    <button class="button" id="btn-export-drawings-list" type="button"><i data-lucide="download"></i> Export Register</button>
                </div>
            </section>

            <!-- Discipline Filter Pills -->
            <div class="tab-list-wrap" style="margin-bottom: 1rem;">
                <div class="tab-list">
                    ${disciplines.map((d, i) => `<button class="tab-button ${i === 0 ? 'active' : ''}" type="button" data-discipline="${d}">${d}</button>`).join('')}
                </div>
            </div>

            <!-- Drawings Grid / Register Table -->
            ${Card.render({
                title: "Active Drawing Revisions",
                eyebrow: "Contract Documents",
                body: `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Sheet #</th>
                                    <th>Title</th>
                                    <th>Discipline</th>
                                    <th>Current Rev</th>
                                    <th>Issue Date</th>
                                    <th>Status</th>
                                    <th style="text-align: right;">View</th>
                                </tr>
                            </thead>
                            <tbody id="drawings-table-body">
                                ${dwgs.map((d) => `
                                    <tr class="clickable-row" data-dwg-id="${d.id}">
                                        <td><strong class="text-primary">${d.sheetNumber}</strong></td>
                                        <td>
                                            <div class="table-title-cell">
                                                <span class="cell-title">${d.title}</span>
                                                <span class="cell-subtext">${d.description || ''}</span>
                                            </div>
                                        </td>
                                        <td><span class="badge info">${d.discipline}</span></td>
                                        <td><span class="badge neutral">${d.rev}</span></td>
                                        <td>${d.issueDate}</td>
                                        <td><span class="badge success">${d.status}</span></td>
                                        <td style="text-align: right;">
                                            <button class="button small secondary" type="button"><i data-lucide="file-image"></i> View Sheet</button>
                                        </td>
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
        const dwgs = recordStore.getDrawings();
        const main = document.getElementById("app-main");

        // Add Sheet Button
        document.getElementById("btn-add-drawing-sheet")?.addEventListener("click", () => {
            const body = `
                <form id="form-add-drawing" class="record-form">
                    <div class="form-grid">
                        <div class="field">
                            <label for="dwg-number">Sheet Number</label>
                            <input class="input" id="dwg-number" name="sheetNumber" required placeholder="e.g. A-102">
                        </div>
                        <div class="field">
                            <label for="dwg-disc">Discipline</label>
                            <select class="select" id="dwg-disc" name="discipline">
                                <option>Architectural</option>
                                <option>Structural</option>
                                <option>Mechanical</option>
                                <option>Electrical</option>
                                <option>Civil</option>
                                <option>Plumbing</option>
                            </select>
                        </div>
                    </div>
                    <div class="field">
                        <label for="dwg-title">Sheet Title</label>
                        <input class="input" id="dwg-title" name="title" required placeholder="e.g. Level 02 Reflected Ceiling Plan">
                    </div>
                    <div class="form-grid">
                        <div class="field">
                            <label for="dwg-rev">Revision Number</label>
                            <input class="input" id="dwg-rev" name="rev" value="Rev 0" required>
                        </div>
                        <div class="field">
                            <label for="dwg-date">Issue Date</label>
                            <input class="input" id="dwg-date" name="issueDate" type="date" value="${new Date().toISOString().split('T')[0]}">
                        </div>
                    </div>
                    <div class="field">
                        <label for="dwg-desc">Description & Key Notes</label>
                        <textarea class="textarea" id="dwg-desc" name="description" placeholder="Notes on revisions, addenda, or scope covered..."></textarea>
                    </div>
                    <div class="split">
                        <span></span>
                        <button class="button primary" type="submit"><i data-lucide="check"></i> Add Sheet to Register</button>
                    </div>
                </form>
            `;

            document.dispatchEvent(new CustomEvent("open-modal", {
                detail: {
                    title: "Add Drawing Sheet",
                    body,
                    onSubmit: (values) => {
                        recordStore.addDrawing(values);
                        document.dispatchEvent(new CustomEvent("toast", { detail: `Sheet ${values.sheetNumber} added` }));
                        location.hash = "#/project";
                    }
                }
            }));
        });

        // Filter by Discipline
        main.querySelectorAll("[data-discipline]").forEach((btn) => {
            btn.addEventListener("click", () => {
                main.querySelectorAll("[data-discipline]").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                const disc = btn.dataset.discipline;
                const filtered = disc === "All" ? dwgs : dwgs.filter(d => d.discipline === disc);

                const tbody = document.getElementById("drawings-table-body");
                if (tbody) {
                    tbody.innerHTML = filtered.map((d) => `
                        <tr class="clickable-row" data-dwg-id="${d.id}">
                            <td><strong class="text-primary">${d.sheetNumber}</strong></td>
                            <td>
                                <div class="table-title-cell">
                                    <span class="cell-title">${d.title}</span>
                                    <span class="cell-subtext">${d.description || ''}</span>
                                </div>
                            </td>
                            <td><span class="badge info">${d.discipline}</span></td>
                            <td><span class="badge neutral">${d.rev}</span></td>
                            <td>${d.issueDate}</td>
                            <td><span class="badge success">${d.status}</span></td>
                            <td style="text-align: right;">
                                <button class="button small secondary" type="button"><i data-lucide="file-image"></i> View Sheet</button>
                            </td>
                        </tr>
                    `).join('');
                    window.lucide?.createIcons();
                }
            });
        });

        // Click Row to Open Blueprint Mock Viewer
        main.addEventListener("click", (e) => {
            const row = e.target.closest("[data-dwg-id]");
            if (!row) return;
            const dwgId = row.dataset.dwgId;
            const item = dwgs.find(d => d.id === dwgId);
            if (!item) return;

            const body = `
                <div class="drawing-viewer-mock">
                    <div class="split" style="margin-bottom: 0.75rem;">
                        <div>
                            <strong>${item.sheetNumber}: ${item.title}</strong>
                            <div class="muted">${item.discipline} &bull; ${item.rev} &bull; Issued ${item.issueDate}</div>
                        </div>
                        <button class="button small primary" type="button" onclick="window.print()"><i data-lucide="printer"></i> Print Sheet</button>
                    </div>

                    <div class="blueprint-canvas">
                        <div class="blueprint-overlay">
                            <span class="blueprint-titleblock">${item.sheetNumber} - ${item.title.toUpperCase()}</span>
                            <div class="blueprint-stamp">CONTRACT DRAWING - CURRENT REV</div>
                            <div class="blueprint-pin" style="top: 35%; left: 45%;" title="RFI-1042 Location Callout">RFI-1042</div>
                            <div class="blueprint-pin" style="top: 60%; left: 70%;" title="ASI-018 Location Callout">ASI-018</div>
                        </div>
                    </div>
                </div>
            `;

            document.dispatchEvent(new CustomEvent("open-modal", {
                detail: {
                    title: `Drawing Sheet ${item.sheetNumber}`,
                    body,
                    onSubmit: null
                }
            }));
        });
    }
}
