import { recordStore } from "../recordStore.js";
import { Card } from "../components/Card.js";
import { PeoplePickerModal } from "../components/PeoplePickerModal.js";
import { Tabs } from "../components/Tabs.js";
import { RolesModal } from "../components/RolesModal.js";
import { Roles } from "../roles.js";

const SETTINGS_TABS = ["Directory", "System Defaults", "Notification Preferences", "Roles & Permissions", "Data Management"];

export class Settings {
    constructor() {
        this.currentTab = SETTINGS_TABS[0];
    }

    render() {
        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Administration</span>
                    <h1>Project Settings</h1>
                    <p>Manage project contacts, document numbering, system defaults, roles & permissions, and account settings.</p>
                </div>
                <div class="toolbar">
                    <button class="button primary" id="btn-add-contact-settings" type="button">
                        <i data-lucide="user-plus"></i> Add Team Member
                    </button>
                </div>
            </section>

            ${Tabs.render(SETTINGS_TABS, this.currentTab)}

            <div id="settings-tab-content">
                ${this._renderTab(this.currentTab)}
            </div>
        `;
    }

    _renderTab(tab) {
        if (tab === "Directory") return this._renderDirectory();
        if (tab === "System Defaults") return this._renderSystemDefaults();
        if (tab === "Notification Preferences") return this._renderNotifications();
        if (tab === "Roles & Permissions") return this._renderRoles();
        if (tab === "Data Management") return this._renderDataManagement();
        return "";
    }

    _renderDirectory() {
        const contacts = recordStore.getContacts();
        return `
            <div class="card">
                <div class="card-header split">
                    <div>
                        <span class="eyebrow">People & Directory</span>
                        <h2 class="card-title">Project Team Directory</h2>
                    </div>
                    <label class="search-shell" style="max-width:260px;">
                        <i data-lucide="search"></i>
                        <input id="dir-search" type="search" placeholder="Filter contacts...">
                    </label>
                </div>
                <div class="contact-list" id="contact-list-wrap">
                    ${contacts.map((c) => this._contactCard(c)).join("")}
                </div>
            </div>
        `;
    }

    _contactCard(c) {
        return `
            <div class="contact-card-item" data-contact-name="${c.name.toLowerCase()}">
                <div class="avatar-circle" style="background:var(--color-primary)">${c.avatar || c.name.slice(0, 2).toUpperCase()}</div>
                <div class="contact-meta">
                    <strong>${c.name}</strong>
                    <span class="subtext">${c.role} &bull; ${c.company}</span>
                    <span class="contact-email"><i data-lucide="mail"></i> ${c.email} &bull; ${c.phone || "(—)"}</span>
                </div>
                <div class="contact-actions">
                    <span class="badge neutral">${c.discipline || "General"}</span>
                </div>
            </div>
        `;
    }

    _renderSystemDefaults() {
        const settings = recordStore.getSettings();
        return `
            ${Card.render({
                title: "System Defaults & Project Standards",
                eyebrow: "Configuration — All fields are editable",
                body: `
                    <form id="form-system-defaults" class="record-form">
                        <div class="settings-section-label">Company & Identity</div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="set-company">Company Name</label>
                                <input class="input" id="set-company" name="companyName" value="${this._esc(settings.companyName || "Apex Construction")}">
                            </div>
                            <div class="field">
                                <label for="set-currency">Default Currency</label>
                                <select class="select" id="set-currency" name="currency">
                                    ${["USD","CAD","EUR","GBP","AUD"].map((c) => `<option${settings.currency === c ? " selected" : ""}>${c}</option>`).join("")}
                                </select>
                            </div>
                        </div>

                        <div class="settings-section-label" style="margin-top:1.25rem;">Document Auto-Numbering Prefixes</div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="set-rfi-pfx">RFI Prefix</label>
                                <div class="input-with-badge">
                                    <input class="input" id="set-rfi-pfx" name="rfiPrefix" value="${this._esc(settings.rfiPrefix || "RFI")}">
                                    <span class="badge neutral" id="rfi-prefix-preview">${settings.rfiPrefix || "RFI"}-0001</span>
                                </div>
                            </div>
                            <div class="field">
                                <label for="set-sub-pfx">Submittal Prefix</label>
                                <div class="input-with-badge">
                                    <input class="input" id="set-sub-pfx" name="submittalPrefix" value="${this._esc(settings.submittalPrefix || "SUB")}">
                                    <span class="badge neutral">${settings.submittalPrefix || "SUB"}-0001</span>
                                </div>
                            </div>
                            <div class="field">
                                <label for="set-co-pfx">Change Order Prefix</label>
                                <div class="input-with-badge">
                                    <input class="input" id="set-co-pfx" name="changeOrderPrefix" value="${this._esc(settings.changeOrderPrefix || "CO")}">
                                    <span class="badge neutral">${settings.changeOrderPrefix || "CO"}-0001</span>
                                </div>
                            </div>
                            <div class="field">
                                <label for="set-ce-pfx">Change Event Prefix</label>
                                <div class="input-with-badge">
                                    <input class="input" id="set-ce-pfx" name="changeEventPrefix" value="${this._esc(settings.changeEventPrefix || "CE")}">
                                    <span class="badge neutral">${settings.changeEventPrefix || "CE"}-0001</span>
                                </div>
                            </div>
                        </div>

                        <div class="settings-section-label" style="margin-top:1.25rem;">Default Assignments</div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="set-ball">Default Ball-In-Court</label>
                                <input class="input" id="set-ball" name="defaultBallInCourt" value="${this._esc(settings.defaultBallInCourt || "Project Manager")}">
                            </div>
                        </div>

                        <div class="split" style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--color-border);">
                            <span class="muted">Changes take effect immediately for new documents.</span>
                            <button class="button primary" type="submit"><i data-lucide="save"></i> Save Settings</button>
                        </div>
                    </form>
                `
            })}
        `;
    }

    _renderNotifications() {
        const items = [
            ["Email on RFI submitted", "rfi-email", true],
            ["Email on Submittal approved", "sub-approved", true],
            ["Email on Change Order executed", "co-exec", true],
            ["Daily Log reminder (7:00 AM)", "daily-log-reminder", false],
            ["Overdue item digest (Weekly)", "overdue-digest", true],
            ["Budget threshold alert (>90%)", "budget-alert", true]
        ];
        return `
            ${Card.render({
                title: "Email & In-App Notifications",
                eyebrow: "Notification Preferences",
                body: `
                    <div class="settings-list">
                        ${items.map(([label, key, defaultOn]) => `
                            <div class="settings-row split">
                                <div>
                                    <strong>${label}</strong>
                                    <p class="muted" style="font-size:0.78rem;margin-top:2px;">Configure when to receive alerts for this action.</p>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="notif-${key}" ${defaultOn ? "checked" : ""}>
                                    <span class="toggle-track"></span>
                                </label>
                            </div>
                        `).join("")}
                    </div>
                    <div style="margin-top:1rem;text-align:right;">
                        <button class="button primary" id="btn-save-notifications" type="button"><i data-lucide="save"></i> Save Preferences</button>
                    </div>
                `
            })}
        `;
    }

    _renderRoles() {
        return `
            ${Card.render({
                title: "Roles & Permissions",
                eyebrow: "Role-based access control",
                body: `
                    <div class="stack">
                        <div class="settings-row split" style="padding:0.75rem 0;border-bottom:1px solid var(--color-border);">
                            <div>
                                <strong>Manage Configurable Roles</strong>
                                <p class="muted" style="font-size:0.78rem;">Create roles, assign permissions, and control access across the app.</p>
                            </div>
                            <div>
                                <button class="button" id="btn-manage-roles" type="button"><i data-lucide="key"></i> Manage Roles</button>
                            </div>
                        </div>
                        <div style="margin-top:0.75rem;">
                            <p class="muted">Roles are stored locally in your browser (IndexedDB). Use the Manage Roles dialog to create or adjust roles and assign permissions. Changes take effect immediately.</p>
                        </div>
                    </div>
                `
            })}
        `;
    }

    _renderDataManagement() {
        return `
            ${Card.render({
                title: "Data Management & Storage",
                eyebrow: "Developer / Admin",
                body: `
                    <div class="stack">
                        <div class="settings-row split" style="padding:0.75rem 0;border-bottom:1px solid var(--color-border);">
                            <div>
                                <strong>Export All Data</strong>
                                <p class="muted" style="font-size:0.78rem;">Download a full JSON export of all project records, contacts, and settings.</p>
                            </div>
                            <button class="button" id="btn-export-all" type="button"><i data-lucide="download"></i> Export JSON</button>
                        </div>
                        <div class="settings-row split" style="padding:0.75rem 0;border-bottom:1px solid var(--color-border);">
                            <div>
                                <strong>localStorage Usage</strong>
                                <p class="muted" style="font-size:0.78rem;">Approximate storage used by this application.</p>
                            </div>
                            <span class="badge neutral" id="storage-size-badge">Calculating...</span>
                        </div>
                        <div class="settings-row split" style="padding:0.75rem 0;">
                            <div>
                                <strong class="text-danger">Reset All Demo Data</strong>
                                <p class="muted" style="font-size:0.78rem;">Clear all stored records and restore seed data. This cannot be undone.</p>
                            </div>
                            <button class="button danger" id="btn-reset-data" type="button"><i data-lucide="trash-2"></i> Reset Data</button>
                        </div>
                    </div>
                `
            })}
        `;
    }

    bind() {
        const main = document.getElementById("app-main");

        // ── Tab switching ────────────────────────────────────────────────
        main.querySelectorAll(".tab-button").forEach((btn) => {
            btn.addEventListener("click", () => {
                main.querySelectorAll(".tab-button").forEach((b) => {
                    b.classList.remove("active");
                    b.setAttribute("aria-selected", "false");
                });
                btn.classList.add("active");
                btn.setAttribute("aria-selected", "true");
                this.currentTab = btn.dataset.tab || btn.textContent.trim();

                const content = document.getElementById("settings-tab-content");
                if (content) {
                    content.innerHTML = this._renderTab(this.currentTab);
                    window.lucide?.createIcons();
                    this._bindTabActions();
                }
            });
        });

        // Add contact
        document.getElementById("btn-add-contact-settings")?.addEventListener("click", () => {
            PeoplePickerModal.openAddContactForm((newContact) => {
                recordStore.addContact(newContact);
                document.dispatchEvent(new CustomEvent("toast", { detail: `Added ${newContact.name} to directory` }));
                location.hash = "#/settings";
            });
        });

        this._bindTabActions();
    }

    _bindTabActions() {
        // Directory search
        document.getElementById("dir-search")?.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll("[data-contact-name]").forEach((el) => {
                el.style.display = el.dataset.contactName.includes(term) ? "" : "none";
            });
        });

        // Save system defaults
        document.getElementById("form-system-defaults")?.addEventListener("submit", (e) => {
            e.preventDefault();
            const vals = Object.fromEntries(new FormData(e.target).entries());
            recordStore.updateSettings(vals);
        });

        // Save notification prefs
        document.getElementById("btn-save-notifications")?.addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("toast", { detail: "Notification preferences saved." }));
        });

        // Manage roles
        document.getElementById("btn-manage-roles")?.addEventListener("click", async () => {
            await RolesModal.open();
        });

        // Export all data
        document.getElementById("btn-export-all")?.addEventListener("click", () => {
            const exportData = {
                records: recordStore.all(),
                contacts: recordStore.getContacts(),
                settings: recordStore.getSettings(),
                project: recordStore.getProjectInfo(),
                budget: recordStore.getBudget(),
                subcontracts: recordStore.getSubcontracts(),
                exportDate: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `cmware-export-${Date.now()}.json`;
            link.click();
        });

        // Storage size
        const sizeEl = document.getElementById("storage-size-badge");
        if (sizeEl) {
            let total = 0;
            for (const k in localStorage) {
                if (Object.prototype.hasOwnProperty.call(localStorage, k)) {
                    total += (localStorage.getItem(k) || "").length * 2;
                }
            }
            sizeEl.textContent = `~${(total / 1024).toFixed(1)} KB`;
        }

        // Reset data
        document.getElementById("btn-reset-data")?.addEventListener("click", () => {
            if (confirm("Reset all project data to seed state? This will delete all records you have created.")) {
                const keysToRemove = Object.keys(localStorage).filter((k) => k.startsWith("cmware_"));
                keysToRemove.forEach((k) => localStorage.removeItem(k));
                document.dispatchEvent(new CustomEvent("toast", { detail: "Data reset. Reloading..." }));
                setTimeout(() => location.reload(), 1200);
            }
        });
    }

    _esc(val) {
        return String(val ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;");
    }
}
