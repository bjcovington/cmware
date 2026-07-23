import { recordStore } from "../recordStore.js";
import { PeoplePickerModal } from "./PeoplePickerModal.js";
import { PdfGenerator } from "../utils/PdfGenerator.js";
import { STATUS_BADGES } from "../constants.js";
import { auth } from "../auth.js";

const STATUS_FLOW = ["Draft", "Open", "Submitted", "In Review", "Pricing", "Issued", "Approved as Noted", "Approved", "Closed"];

export class RecordDetailModal {
    static open(recordId, onRefresh) {
        let record = recordStore.all().find((r) => r.id === recordId);
        if (!record) return;

        this._render(record, onRefresh);
    }

    static _render(record, onRefresh) {
        const currentUser = auth.getCurrentUser();
        const statusBadge = STATUS_BADGES[record.status] || "neutral";
        const isRfi = record.module === "rfis";
        const isSubmittal = record.module === "submittals";
        const isChange = ["change-events", "change-orders", "ccds", "asis", "proposal-requests", "notifications"].includes(record.module);

        const body = `
            <div class="record-detail-container">
                <!-- Toolbar -->
                <div class="detail-toolbar split">
                    <div class="cluster" style="flex-wrap:wrap;gap:6px;">
                        <span class="badge ${statusBadge} large">${record.status}</span>
                        ${record.priority ? `<span class="badge ${record.priority === "High" || record.priority === "Critical" ? "danger" : "neutral"}">${record.priority} Priority</span>` : ""}
                        ${record.type ? `<span class="badge info">${record.type}</span>` : ""}
                    </div>
                    <div class="cluster" style="gap:6px;flex-wrap:wrap;">
                        <button class="button small" id="btn-edit-record" type="button"><i data-lucide="edit-3"></i> Edit</button>
                        <button class="button small" id="btn-print-record-pdf" type="button"><i data-lucide="printer"></i> Print PDF</button>
                        <button class="button small" id="btn-assign-contact" type="button"><i data-lucide="user-check"></i> Assign</button>
                        <button class="button small primary" id="btn-advance-status" type="button"><i data-lucide="step-forward"></i> Advance</button>
                    </div>
                </div>

                <!-- Metadata Grid -->
                <div class="detail-meta-grid">
                    <div class="meta-card"><span class="meta-label">Document #</span><strong>${record.number}</strong></div>
                    <div class="meta-card"><span class="meta-label">Ball In Court</span><strong id="detail-assigned-name">${record.ballInCourt || record.assignedTo || "Unassigned"}</strong></div>
                    <div class="meta-card"><span class="meta-label">Due Date</span><strong>${record.due || "Unscheduled"}</strong></div>
                    <div class="meta-card"><span class="meta-label">Cost Impact</span><strong class="${record.costImpact && record.costImpact !== "$0" && record.costImpact !== "N/A" ? "text-danger" : ""}">${record.costImpact || "$0"}</strong></div>
                    <div class="meta-card"><span class="meta-label">Schedule Impact</span><strong>${record.scheduleImpact || "0 Days"}</strong></div>
                    <div class="meta-card"><span class="meta-label">Spec / Drawing Ref</span><strong>${record.specSection || record.drawingNumber || "N/A"}</strong></div>
                    ${record.reason ? `<div class="meta-card"><span class="meta-label">Reason for Change</span><strong>${record.reason}</strong></div>` : ""}
                    ${record.createdAt ? `<div class="meta-card"><span class="meta-label">Date Created</span><strong>${record.createdAt}</strong></div>` : ""}
                </div>

                <!-- Document Content -->
                <div class="detail-sections-wrap">
                    <div class="detail-card">
                        <h3><i data-lucide="file-text"></i> Document Summary</h3>
                        <p class="record-title-hero"><strong>${record.title}</strong></p>

                        ${isRfi ? `
                            <div class="q-and-a-block">
                                <div class="qa-box question-box">
                                    <div class="qa-header"><i data-lucide="help-circle"></i><strong>Question / Problem Statement</strong></div>
                                    <p>${record.question || record.description || "No question provided."}</p>
                                </div>
                                <div class="qa-box suggestion-box">
                                    <div class="qa-header"><i data-lucide="lightbulb"></i><strong>Contractor Recommendation / Suggestion</strong></div>
                                    <p>${record.suggestion || "No contractor suggestion submitted."}</p>
                                </div>
                                <div class="qa-box answer-box">
                                    <div class="qa-header"><i data-lucide="check-circle-2"></i><strong>Official Architect / Engineer Response</strong></div>
                                    <p id="official-answer-text">${record.officialAnswer || "Pending Architect/Engineer review."}</p>
                                </div>
                            </div>
                        ` : isSubmittal ? `
                            <div class="submittal-details-block">
                                <div class="grid-2" style="gap:0.5rem;margin-bottom:0.75rem;">
                                    <div><strong>Submittal Type:</strong> <span class="badge info">${record.type || "Product Data"}</span></div>
                                    <div><strong>Spec Section:</strong> ${record.specSection || "N/A"}</div>
                                    <div><strong>Manufacturer:</strong> ${record.manufacturer || "N/A"}</div>
                                    <div><strong>Lead Time:</strong> ${record.leadTime || "N/A"}</div>
                                    <div><strong>Subcontractor:</strong> ${record.subcontractor || "N/A"}</div>
                                </div>
                                <div><strong>Description:</strong> <p>${record.description || record.question || "N/A"}</p></div>
                                <div class="qa-box answer-box" style="margin-top:0.75rem;">
                                    <div class="qa-header"><i data-lucide="check-circle-2"></i><strong>Reviewer Stamp / Comments</strong></div>
                                    <p id="official-answer-text">${record.officialAnswer || "Under review."}</p>
                                </div>
                            </div>
                        ` : `
                            <div>
                                ${record.reason ? `<p><strong>Reason:</strong> ${record.reason}</p>` : ""}
                                <p style="white-space:pre-line;">${record.description || record.question || "No scope provided."}</p>
                            </div>
                        `}
                    </div>

                    <!-- Official Response Form -->
                    <div class="detail-card">
                        <h3><i data-lucide="message-square-plus"></i> Post Official Response</h3>
                        <form id="form-post-response" class="stack">
                            <div class="field">
                                <label for="response-text">Official Answer / Review Comments</label>
                                <textarea id="response-text" name="officialAnswer" class="textarea" rows="3"
                                    placeholder="Enter official answer, approval notes, or reviewer comments..."></textarea>
                            </div>
                            <div class="form-grid">
                                <div class="field">
                                    <label for="response-status">Set Status</label>
                                    <select id="response-status" name="nextStatus" class="select">
                                        <option value="Closed">Closed (Resolved)</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Approved as Noted">Approved as Noted</option>
                                        <option value="In Review">In Review</option>
                                        <option value="Revise and Resubmit">Revise and Resubmit</option>
                                        <option value="No Exceptions">No Exceptions Taken</option>
                                    </select>
                                </div>
                                <div class="field" style="align-self:flex-end;">
                                    <button class="button primary fill" type="submit"><i data-lucide="send"></i> Submit Response</button>
                                </div>
                            </div>
                        </form>
                    </div>

                    <!-- Attachments -->
                    <div class="detail-card">
                        <div class="split">
                            <h3><i data-lucide="paperclip"></i> Attachments (${record.attachments?.length || 0})</h3>
                            <button class="button small" id="btn-add-attachment" type="button"><i data-lucide="upload-cloud"></i> Attach File</button>
                        </div>
                        <div id="attachment-list-wrap" style="margin-top:0.5rem;">
                            ${record.attachments?.length ? record.attachments.map((file) => `
                                <div class="attachment-item split">
                                    <span class="cluster"><i data-lucide="file"></i> <strong>${file}</strong></span>
                                    <button class="button small ghost" type="button"
                                        onclick="document.dispatchEvent(new CustomEvent('toast',{detail:'Downloading ${file}...'}))">
                                        <i data-lucide="download"></i> Download
                                    </button>
                                </div>
                            `).join("") : `<p class="muted">No attachments linked to this record.</p>`}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: { title: `${record.number}: ${record.title}`, body, onSubmit: null }
        }));

        setTimeout(() => {
            this._bindDetailEvents(record, onRefresh, currentUser);
            window.lucide?.createIcons();
        }, 50);
    }

    static _bindDetailEvents(record, onRefresh, currentUser) {
        // Print PDF
        document.getElementById("btn-print-record-pdf")?.addEventListener("click", () => {
            PdfGenerator.printRecord(record);
        });

        // Assign Contact
        document.getElementById("btn-assign-contact")?.addEventListener("click", () => {
            PeoplePickerModal.open({
                title: "Assign Ball-In-Court Contact",
                onSelect: (contact) => {
                    const newName = `${contact.name} (${contact.company})`;
                    recordStore.updateRecord(record.id, {
                        ballInCourt: newName,
                        assignedTo: contact.name,
                        assignedCompany: contact.company
                    });
                    const nameEl = document.getElementById("detail-assigned-name");
                    if (nameEl) nameEl.textContent = newName;
                    document.dispatchEvent(new CustomEvent("toast", { detail: `Assigned to ${contact.name}` }));
                    if (onRefresh) onRefresh();
                }
            });
        });

        // Advance Status
        document.getElementById("btn-advance-status")?.addEventListener("click", () => {
            const currentIdx = STATUS_FLOW.indexOf(record.status);
            const nextStatus = STATUS_FLOW[Math.min(currentIdx + 1, STATUS_FLOW.length - 1)] || "Closed";
            recordStore.updateStatus(record.id, nextStatus);
            document.dispatchEvent(new CustomEvent("toast", { detail: `${record.number} advanced to ${nextStatus}` }));
            document.getElementById("modal-close")?.click();
            if (onRefresh) onRefresh();
        });

        // Edit Record Button → Opens edit modal
        document.getElementById("btn-edit-record")?.addEventListener("click", () => {
            this._openEditForm(record, onRefresh);
        });

        // Post Official Response
        document.getElementById("form-post-response")?.addEventListener("submit", (e) => {
            e.preventDefault();
            const vals = Object.fromEntries(new FormData(e.target).entries());
            if (!vals.officialAnswer?.trim()) {
                document.dispatchEvent(new CustomEvent("toast", { detail: "Please enter response text." }));
                return;
            }
            recordStore.addResponse(record.id, {
                officialAnswer: vals.officialAnswer,
                nextStatus: vals.nextStatus,
                answeredBy: currentUser.name
            });
            document.dispatchEvent(new CustomEvent("toast", { detail: "Official response submitted." }));
            document.getElementById("modal-close")?.click();
            if (onRefresh) onRefresh();
        });

        // Add Mock Attachment
        document.getElementById("btn-add-attachment")?.addEventListener("click", () => {
            const samples = [
                "Structural-Calculation-Sheet.pdf",
                "Field-Photo-Elevation.jpg",
                "Spec-07-42-13-Addendum.pdf",
                "Submittal-Review-Stamp.pdf",
                "RFI-Response-Letter.pdf",
                "Shop-Drawing-Rev2.pdf"
            ];
            const file = samples[Math.floor(Math.random() * samples.length)];
            const atts = [...(record.attachments || []), file];
            recordStore.updateRecord(record.id, { attachments: atts });
            document.dispatchEvent(new CustomEvent("toast", { detail: `Attached: ${file}` }));
            document.getElementById("modal-close")?.click();
            if (onRefresh) onRefresh();
        });
    }

    static _openEditForm(record, onRefresh) {
        const isRfi = record.module === "rfis";
        const isSubmittal = record.module === "submittals";

        const body = `
            <form id="form-edit-record" class="record-form">
                <div class="field">
                    <label for="edit-title">Title</label>
                    <input class="input" id="edit-title" name="title" value="${this._esc(record.title)}" required>
                </div>

                ${isSubmittal ? `
                    <div class="form-grid">
                        <div class="field">
                            <label for="edit-type">Submittal Type</label>
                            <select class="select" id="edit-type" name="type">
                                ${["Product Data","Shop Drawings","Samples","Mockups","Certificates","O&M Manuals","Test Reports","Warranties"]
                                    .map((t) => `<option${record.type === t ? " selected" : ""}>${t}</option>`).join("")}
                            </select>
                        </div>
                        <div class="field">
                            <label for="edit-spec">Spec Section</label>
                            <input class="input" id="edit-spec" name="specSection" value="${this._esc(record.specSection)}">
                        </div>
                    </div>
                    <div class="form-grid">
                        <div class="field">
                            <label for="edit-mfr">Manufacturer</label>
                            <input class="input" id="edit-mfr" name="manufacturer" value="${this._esc(record.manufacturer)}">
                        </div>
                        <div class="field">
                            <label for="edit-lead">Lead Time</label>
                            <input class="input" id="edit-lead" name="leadTime" value="${this._esc(record.leadTime)}">
                        </div>
                    </div>
                ` : isRfi ? `
                    <div class="form-grid">
                        <div class="field">
                            <label for="edit-spec">Spec Section</label>
                            <input class="input" id="edit-spec" name="specSection" value="${this._esc(record.specSection)}">
                        </div>
                        <div class="field">
                            <label for="edit-dwg">Drawing Reference</label>
                            <input class="input" id="edit-dwg" name="drawingNumber" value="${this._esc(record.drawingNumber)}">
                        </div>
                    </div>
                ` : ""}

                <div class="form-grid">
                    <div class="field">
                        <label for="edit-status">Status</label>
                        <select class="select" id="edit-status" name="status">
                            ${STATUS_FLOW.map((s) => `<option${record.status === s ? " selected" : ""}>${s}</option>`).join("")}
                        </select>
                    </div>
                    <div class="field">
                        <label for="edit-priority">Priority</label>
                        <select class="select" id="edit-priority" name="priority">
                            ${["Normal","High","Critical","Low"].map((p) => `<option${record.priority === p ? " selected" : ""}>${p}</option>`).join("")}
                        </select>
                    </div>
                </div>

                <div class="form-grid">
                    <div class="field">
                        <label for="edit-cost">Cost Impact</label>
                        <input class="input" id="edit-cost" name="costImpact" value="${this._esc(record.costImpact || "$0")}">
                    </div>
                    <div class="field">
                        <label for="edit-sched">Schedule Impact</label>
                        <input class="input" id="edit-sched" name="scheduleImpact" value="${this._esc(record.scheduleImpact || "0 Days")}">
                    </div>
                </div>

                <div class="field">
                    <label for="edit-due">Due Date</label>
                    <input class="input" id="edit-due" name="due" type="date" value="${this._esc(record.due)}">
                </div>

                ${isRfi ? `
                    <div class="field">
                        <label for="edit-question">Question / Problem Statement</label>
                        <textarea class="textarea" id="edit-question" name="question" rows="3">${this._esc(record.question || record.description)}</textarea>
                    </div>
                    <div class="field">
                        <label for="edit-suggestion">Contractor Recommendation</label>
                        <textarea class="textarea" id="edit-suggestion" name="suggestion" rows="2">${this._esc(record.suggestion)}</textarea>
                    </div>
                ` : `
                    <div class="field">
                        <label for="edit-desc">Description / Scope</label>
                        <textarea class="textarea" id="edit-desc" name="description" rows="3">${this._esc(record.description || record.question)}</textarea>
                    </div>
                `}

                <div class="split" style="border-top:1px solid var(--color-border);padding-top:0.75rem;">
                    <span class="muted">Editing ${record.number}</span>
                    <button class="button primary" type="submit"><i data-lucide="save"></i> Save Changes</button>
                </div>
            </form>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: `Edit ${record.number}`,
                body,
                onSubmit: (values) => {
                    recordStore.updateRecord(record.id, values);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `${record.number} updated` }));
                    if (onRefresh) onRefresh();
                }
            }
        }));
    }

    static _esc(val) {
        return String(val ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;");
    }
}
