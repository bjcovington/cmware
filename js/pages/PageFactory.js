import { recordStore } from "../recordStore.js";
import { Button } from "../components/Button.js";
import { Card } from "../components/Card.js";
import { Table } from "../components/Table.js";
import { Tabs } from "../components/Tabs.js";
import { RecordDetailModal } from "../components/RecordDetailModal.js";
import { PeoplePickerModal } from "../components/PeoplePickerModal.js";
import { PdfGenerator } from "../utils/PdfGenerator.js";

const statusFlow = ["Draft", "Open", "Submitted", "In Review", "Pricing", "Issued", "Approved", "Closed"];

const MODULE_TABS = ["All Items", "My Ball In Court", "Overdue", "Drafts", "Closed"];

function toModuleKey(title) {
    return title.toLowerCase().replaceAll(" ", "-");
}

function toPrefix(title) {
    const matches = title.match(/[A-Z]/g);
    if (title === "Proposal Requests") return "PR";
    if (title === "Change Events") return "CE";
    if (title === "Change Orders") return "CO";
    if (matches?.length > 1) return matches.join("");
    return title.slice(0, 3).toUpperCase();
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export class PageFactory {
    constructor({ title, subtitle, icon = "folder-kanban", actions = ["New", "Export"], moduleKey, routePath, prefix }) {
        this.title = title;
        this.subtitle = subtitle;
        this.icon = icon;
        this.actions = actions;
        this.moduleKey = moduleKey || toModuleKey(title);
        this.routePath = routePath || this.moduleKey;
        this.prefix = prefix || toPrefix(title);
        this.currentTab = "All Items";
    }

    render({ params } = {}) {
        const query = params?.get("q") || "";
        const allRows = this.moduleKey === "search"
            ? recordStore.search(query)
            : recordStore.filterByTab(this.moduleKey, this.currentTab);
        const filteredRows = allRows.filter((record) => this.matchesFilter(record, query));

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Module Controls</span>
                    <h1>${this.title}</h1>
                    <p>${this.subtitle}</p>
                </div>
                <div class="toolbar">
                    ${this.actions.map((action, index) => Button.render({
                        label: action,
                        icon: action.includes("Export") ? "download" : "plus",
                        variant: index === 0 ? "primary" : "",
                        id: `${this.moduleKey}-${action.toLowerCase().replaceAll(" ", "-")}`
                    })).join("")}
                </div>
            </section>

            ${this.moduleKey !== "search" ? Tabs.render(MODULE_TABS, this.currentTab) : ""}

            <section class="card register-tools">
                <label class="search-shell">
                    <i data-lucide="search"></i>
                    <input id="${this.moduleKey}-filter" type="search" value="${escapeHtml(query)}" placeholder="Filter ${this.title} register...">
                </label>
                <div class="record-summary">
                    <strong id="${this.moduleKey}-count">${filteredRows.length}</strong>
                    <span class="muted">${filteredRows.length === 1 ? "record" : "records"}</span>
                </div>
            </section>

            ${Card.render({
                title: `${this.title} Register`,
                eyebrow: `${this.currentTab}`,
                actions: `<button class="icon-button" type="button" aria-label="Filter"><i data-lucide="list-filter"></i></button>`,
                body: Table.render({
                    columns: ["Number", "Title & Details", "Status", "Ball In Court / Assignee", "Due Date"],
                    rows: filteredRows,
                    actions: this.moduleKey !== "search"
                })
            })}
        `;
    }

    bind({ params } = {}) {
        const main = document.getElementById("app-main");
        const newButton = document.getElementById(`${this.moduleKey}-${this.actions[0].toLowerCase().replaceAll(" ", "-")}`);
        const exportButton = document.getElementById(`${this.moduleKey}-export`);
        const filter = document.getElementById(`${this.moduleKey}-filter`);

        newButton?.addEventListener("click", () => this.openCreateForm());
        exportButton?.addEventListener("click", () => this.exportCsv());

        // ─── Tab Switching (fixed) ──────────────────────────────────────────
        main.querySelectorAll(".tab-button").forEach((btn) => {
            btn.addEventListener("click", () => {
                // Update active state visually
                main.querySelectorAll(".tab-button").forEach((b) => {
                    b.classList.remove("active");
                    b.setAttribute("aria-selected", "false");
                });
                btn.classList.add("active");
                btn.setAttribute("aria-selected", "true");

                this.currentTab = btn.dataset.tab || btn.textContent.trim();

                // Re-filter rows
                const query = filter?.value?.trim() || "";
                const rows = recordStore.filterByTab(this.moduleKey, this.currentTab)
                    .filter((record) => this.matchesFilter(record, query));

                // Update count
                const countEl = document.getElementById(`${this.moduleKey}-count`);
                if (countEl) countEl.textContent = rows.length;

                // Re-render table body
                const tableCard = main.querySelector(".card:nth-of-type(2)");
                if (tableCard) {
                    const tableWrap = tableCard.querySelector(".table-wrap");
                    if (tableWrap) {
                        tableWrap.outerHTML = Table.render({
                            columns: ["Number", "Title & Details", "Status", "Ball In Court / Assignee", "Due Date"],
                            rows,
                            actions: true
                        });
                    }
                    // Update eyebrow
                    const eyebrow = tableCard.querySelector(".eyebrow");
                    if (eyebrow) eyebrow.textContent = this.currentTab;
                    window.lucide?.createIcons();
                }
            });
        });

        // ─── Search / Filter ───────────────────────────────────────────────
        filter?.addEventListener("input", () => {
            const next = filter.value.trim();
            if (this.moduleKey === "search") {
                location.hash = next ? `#/search?q=${encodeURIComponent(next)}` : "#/search";
                return;
            }
            const rows = recordStore.filterByTab(this.moduleKey, this.currentTab)
                .filter((record) => this.matchesFilter(record, next));

            const countEl = document.getElementById(`${this.moduleKey}-count`);
            if (countEl) countEl.textContent = rows.length;

            const tableCard = main.querySelector(".card:nth-of-type(2)");
            if (tableCard) {
                const tableWrap = tableCard.querySelector(".table-wrap");
                if (tableWrap) {
                    tableWrap.outerHTML = Table.render({
                        columns: ["Number", "Title & Details", "Status", "Ball In Court / Assignee", "Due Date"],
                        rows,
                        actions: true
                    });
                    window.lucide?.createIcons();
                }
            }
        });

        // ─── Row Clicks & Action Buttons ──────────────────────────────────
        main.onclick = (event) => {
            const button = event.target.closest("[data-action]");
            const row = event.target.closest(".clickable-row");

            if (button) {
                event.stopPropagation();
                const recordId = button.dataset.recordId;
                const record = recordStore.all().find((item) => item.id === recordId);

                if (button.dataset.action === "view") {
                    RecordDetailModal.open(recordId, () => this.refresh(params));
                    return;
                }
                if (button.dataset.action === "print") {
                    if (record) PdfGenerator.printRecord(record);
                    return;
                }
                if (button.dataset.action === "advance") {
                    const nextStatus = statusFlow[Math.min(statusFlow.indexOf(record.status) + 1, statusFlow.length - 1)] || "Closed";
                    recordStore.updateStatus(record.id, nextStatus);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `${record.number} advanced to ${nextStatus}` }));
                    this.refresh(params);
                    return;
                }
                if (button.dataset.action === "delete") {
                    if (confirm(`Delete ${record?.number || "this record"}? This cannot be undone.`)) {
                        recordStore.remove(recordId);
                        document.dispatchEvent(new CustomEvent("toast", { detail: "Record deleted" }));
                        this.refresh(params);
                    }
                    return;
                }
                return;
            }

            if (row) {
                const recordId = row.dataset.recordId;
                RecordDetailModal.open(recordId, () => this.refresh(params));
            }
        };
    }

    openCreateForm() {
        const isRfi = this.moduleKey === "rfis";
        const isSubmittal = this.moduleKey === "submittals";
        const isChange = ["change-events", "change-orders"].includes(this.moduleKey);

        const singularTitle = this.title.endsWith("ies")
            ? `${this.title.slice(0, -3)}y`
            : this.title.endsWith("s")
                ? this.title.slice(0, -1)
                : this.title;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: `New ${singularTitle}`,
                body: this.formMarkup(isRfi, isSubmittal, isChange),
                onSubmit: (values) => {
                    const record = recordStore.create(this.moduleKey, values, this.prefix);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `${record.number} created successfully` }));
                    this.refresh();
                }
            }
        }));

        setTimeout(() => {
            const ballInput = document.getElementById("record-ball");
            const searchPersonBtn = document.getElementById("btn-search-person-picker");
            searchPersonBtn?.addEventListener("click", () => {
                PeoplePickerModal.open({
                    onSelect: (contact) => {
                        if (ballInput) ballInput.value = `${contact.name} (${contact.company})`;
                    }
                });
            });
        }, 50);
    }

    formMarkup(isRfi, isSubmittal, isChange) {
        return `
            <form class="record-form">
                <div class="field">
                    <label for="record-title">Subject / Title</label>
                    <input class="input" id="record-title" name="title" required placeholder="Short summary of request">
                </div>

                ${isSubmittal ? `
                    <div class="form-grid">
                        <div class="field">
                            <label for="record-sub-type">Submittal Type</label>
                            <select class="select" id="record-sub-type" name="type">
                                <option>Product Data</option>
                                <option>Shop Drawings</option>
                                <option>Samples</option>
                                <option>Mockups</option>
                                <option>Certificates</option>
                                <option>O&amp;M Manuals</option>
                                <option>Test Reports</option>
                                <option>Warranties</option>
                            </select>
                        </div>
                        <div class="field">
                            <label for="record-spec">CSI Spec Section</label>
                            <input class="input" id="record-spec" name="specSection" placeholder="e.g. 07 42 13 Metal Panels">
                        </div>
                    </div>
                    <div class="form-grid">
                        <div class="field">
                            <label for="record-mfr">Manufacturer / Brand</label>
                            <input class="input" id="record-mfr" name="manufacturer" placeholder="e.g. Centria Formawall">
                        </div>
                        <div class="field">
                            <label for="record-lead">Lead Time</label>
                            <input class="input" id="record-lead" name="leadTime" placeholder="e.g. 6 Weeks">
                        </div>
                    </div>
                    <div class="field">
                        <label for="record-subcontractor">Subcontractor / Submitting Trade</label>
                        <input class="input" id="record-subcontractor" name="subcontractor" placeholder="e.g. Exterior Concepts LLC">
                    </div>
                ` : ""}

                ${isRfi ? `
                    <div class="form-grid">
                        <div class="field">
                            <label for="record-spec">Spec Section Reference</label>
                            <input class="input" id="record-spec" name="specSection" placeholder="e.g. 09 22 16 Non-Structural Metal Framing">
                        </div>
                        <div class="field">
                            <label for="record-dwg">Drawing Sheet Reference</label>
                            <input class="input" id="record-dwg" name="drawingNumber" placeholder="e.g. A-302 Detail 4">
                        </div>
                    </div>
                ` : ""}

                ${isChange ? `
                    <div class="field">
                        <label for="record-reason">Reason for Change</label>
                        <select class="select" id="record-reason" name="reason">
                            <option value="">-- Select Reason --</option>
                            <option>Owner Requested Scope Addition</option>
                            <option>Unforeseen Field Condition</option>
                            <option>Design Omission or Error</option>
                            <option>Code / Authority Having Jurisdiction</option>
                            <option>Differing Site Conditions</option>
                            <option>Value Engineering Substitution</option>
                        </select>
                    </div>
                ` : ""}

                <div class="form-grid">
                    <div class="field">
                        <label for="record-status">Status</label>
                        <select class="select" id="record-status" name="status">
                            ${statusFlow.map((s) => `<option>${s}</option>`).join("")}
                        </select>
                    </div>
                    <div class="field">
                        <label for="record-priority">Priority</label>
                        <select class="select" id="record-priority" name="priority">
                            <option>Normal</option>
                            <option>High</option>
                            <option>Critical</option>
                            <option>Low</option>
                        </select>
                    </div>
                </div>

                <div class="form-grid">
                    <div class="field">
                        <label for="record-ball">Ball In Court / Assigned To</label>
                        <div class="input-with-button">
                            <input class="input" id="record-ball" name="ballInCourt" placeholder="Click search to pick contact..." readonly>
                            <button class="button small secondary" id="btn-search-person-picker" type="button"><i data-lucide="search"></i> Select</button>
                        </div>
                    </div>
                    <div class="field">
                        <label for="record-due">Due Date</label>
                        <input class="input" id="record-due" name="due" type="date">
                    </div>
                </div>

                <div class="form-grid">
                    <div class="field">
                        <label for="record-cost-impact">Cost Impact ($)</label>
                        <input class="input" id="record-cost-impact" name="costImpact" placeholder="e.g. $12,500 or $0 / N/A">
                    </div>
                    <div class="field">
                        <label for="record-sched">Schedule Impact (Days)</label>
                        <input class="input" id="record-sched" name="scheduleImpact" placeholder="e.g. 2 Days or 0 Days">
                    </div>
                </div>

                ${isRfi ? `
                    <div class="field">
                        <label for="record-question">Question / Problem Statement</label>
                        <textarea class="textarea" id="record-question" name="question" rows="3" required placeholder="Detail the field condition, conflict, or design question..."></textarea>
                    </div>
                    <div class="field">
                        <label for="record-suggestion">Contractor Recommendation / Suggestion</label>
                        <textarea class="textarea" id="record-suggestion" name="suggestion" rows="2" placeholder="Proposed solution, detail reference, or product alternative..."></textarea>
                    </div>
                ` : `
                    <div class="field">
                        <label for="record-description">Scope & Description</label>
                        <textarea class="textarea" id="record-description" name="description" rows="3" placeholder="Scope details, review notes, or directive requirements..."></textarea>
                    </div>
                `}

                <div class="split" style="border-top:1px solid var(--color-border);padding-top:0.75rem;margin-top:0.5rem;">
                    <span class="muted">Next Number: ${this.prefix}-####</span>
                    ${Button.render({ label: "Create Record", icon: "check", variant: "primary", type: "submit" })}
                </div>
            </form>
        `;
    }

    matchesFilter(record, query) {
        const term = String(query || "").trim().toLowerCase();
        if (!term) return true;
        return [record.number, record.title, record.status, record.ballInCourt,
                record.assignedTo, record.due, record.description, record.question, record.specSection]
            .some((v) => String(v || "").toLowerCase().includes(term));
    }

    exportCsv() {
        const rows = recordStore.byModule(this.moduleKey);
        const header = ["Number", "Title", "Status", "Ball In Court", "Due Date", "Spec Section", "Cost Impact", "Question / Description"];
        const csvRows = rows.map((r) => [
            r.number, r.title, r.status, r.ballInCourt || r.assignedTo,
            r.due, r.specSection || "", r.costImpact || 0, r.question || r.description || ""
        ]);
        const csv = [header, ...csvRows]
            .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${this.moduleKey}-export.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    refresh(params) {
        document.getElementById("app-main").innerHTML = this.render({ params });
        this.bind({ params });
        window.lucide?.createIcons();
    }
}
