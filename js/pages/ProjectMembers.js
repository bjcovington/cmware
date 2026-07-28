import { recordStore } from "../recordStore.js";
import { Card } from "../components/Card.js";
import { PROJECT_ROLES } from "../constants.js";
import { PeoplePickerModal } from "../components/PeoplePickerModal.js";

const PROJECT_MEMBERS_KEY = "cmware_project_members";

const SEED_PROJECT_MEMBERS = [
    {
        id: "pm-001",
        projectId: "RIV-104",
        userId: "usr-001",
        name: "Marcus Vance",
        email: "marcus.vance@apexconstruct.com",
        company: "Apex Construction",
        role: "Senior Project Manager",
        discipline: "General Contractor",
        avatar: "MV",
        permissions: ["admin", "financial", "schedule", "documents", "field", "reports"],
        assignedDate: "2025-09-01",
        status: "Active"
    },
    {
        id: "pm-002",
        projectId: "RIV-104",
        userId: "usr-002",
        name: "Sarah Jenkins",
        email: "sjenkins@designstudio.com",
        company: "Design Studio International",
        role: "Lead Architect",
        discipline: "Architectural",
        avatar: "SJ",
        permissions: ["documents", "schedule", "reports"],
        assignedDate: "2025-09-01",
        status: "Active"
    },
    {
        id: "pm-003",
        projectId: "RIV-104",
        userId: "usr-003",
        name: "David Miller",
        email: "dmiller@millereng.com",
        company: "Miller & Associates Engineers",
        role: "Structural Engineer",
        discipline: "Structural",
        avatar: "DM",
        permissions: ["documents", "schedule", "reports"],
        assignedDate: "2025-09-01",
        status: "Active"
    },
    {
        id: "pm-004",
        projectId: "RIV-104",
        userId: "usr-004",
        name: "Carlos Rodriguez",
        email: "carlos@voltelectric.com",
        company: "Volt Electric Inc.",
        role: "Electrical Trade Lead",
        discipline: "Electrical",
        avatar: "CR",
        permissions: ["documents", "field", "reports"],
        assignedDate: "2025-10-15",
        status: "Active"
    }
];

function getProjectMembers() {
    const stored = localStorage.getItem(PROJECT_MEMBERS_KEY);
    if (!stored) {
        localStorage.setItem(PROJECT_MEMBERS_KEY, JSON.stringify(SEED_PROJECT_MEMBERS));
        return [...SEED_PROJECT_MEMBERS];
    }
    try {
        return JSON.parse(stored);
    } catch {
        localStorage.setItem(PROJECT_MEMBERS_KEY, JSON.stringify(SEED_PROJECT_MEMBERS));
        return [...SEED_PROJECT_MEMBERS];
    }
}

function setProjectMembers(data) {
    localStorage.setItem(PROJECT_MEMBERS_KEY, JSON.stringify(data));
    document.dispatchEvent(new CustomEvent("project-members-changed"));
}

function getCurrentProjectId() {
    return localStorage.getItem("cm.selectedProject") || "RIV-104";
}

export class ProjectMembers {
    constructor() {
        this.currentTab = "All Members";
        this.searchTerm = "";
    }

    render() {
        const projectId = getCurrentProjectId();
        const members = getProjectMembers().filter(m => m.projectId === projectId);
        const activeMembers = members.filter(m => m.status === "Active");
        const inactiveMembers = members.filter(m => m.status === "Inactive");

        const tabs = ["All Members", "Active", "Inactive"];

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Administration</span>
                    <h1>Project Team Members</h1>
                    <p>Manage project assignments, roles, and permissions for <strong>${recordStore.getProjectInfo().name}</strong>.</p>
                </div>
                <div class="toolbar">
                    <button class="button primary" id="btn-add-member" type="button">
                        <i data-lucide="user-plus"></i> Add Team Member
                    </button>
                </div>
            </section>

            <div class="tabs-container">
                <div class="tab-list" role="tablist">
                    ${tabs.map(t => `
                        <button class="tab-button ${this.currentTab === t ? "active" : ""}" role="tab" data-tab="${t}" aria-selected="${this.currentTab === t}">
                            ${t} <span class="tab-count">${this._getTabCount(t, members, activeMembers, inactiveMembers)}</span>
                        </button>
                    `).join("")}
                </div>
            </div>

            <div id="members-content">
                ${this._renderMemberList(this.currentTab, members, activeMembers, inactiveMembers)}
            </div>
        `;
    }

    _getTabCount(tab, all, active, inactive) {
        if (tab === "All Members") return all.length;
        if (tab === "Active") return active.length;
        if (tab === "Inactive") return inactive.length;
        return 0;
    }

    _renderMemberList(tab, all, active, inactive) {
        let members = all;
        if (tab === "Active") members = active;
        if (tab === "Inactive") members = inactive;

        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            members = members.filter(m =>
                m.name.toLowerCase().includes(term) ||
                m.email.toLowerCase().includes(term) ||
                m.company.toLowerCase().includes(term) ||
                m.role.toLowerCase().includes(term)
            );
        }

        if (members.length === 0) {
            return `
                <div class="card">
                    <div class="empty-inline" style="padding: 3rem; text-align: center;">
                        <i data-lucide="users" class="empty-icon"></i>
                        <h3>No team members found</h3>
                        <p class="muted">${tab === "All Members" ? "Add your first project team member to get started." : `No ${tab.toLowerCase()} members.`}</p>
                        <button class="button primary" id="btn-add-first-member" type="button"><i data-lucide="user-plus"></i> Add Team Member</button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="card">
                <div class="table-wrap">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Company</th>
                                <th>Role</th>
                                <th>Discipline</th>
                                <th>Permissions</th>
                                <th>Assigned</th>
                                <th>Status</th>
                                <th style="text-align: right;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${members.map(m => `
                                <tr data-member-id="${m.id}">
                                    <td>
                                        <div class="table-title-cell">
                                            <div class="avatar-circle small" style="background: var(--color-primary)">${m.avatar}</div>
                                            <div>
                                                <span class="cell-title">${m.name}</span>
                                                <span class="cell-subtext">${m.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${m.company}</td>
                                    <td><span class="badge neutral">${m.role}</span></td>
                                    <td><span class="badge neutral">${m.discipline}</span></td>
                                    <td>
                                        <div class="permission-badges">
                                            ${m.permissions.map(p => `<span class="permission-badge">${this._formatPermission(p)}</span>`).join("")}
                                        </div>
                                    </td>
                                    <td>${m.assignedDate}</td>
                                    <td><span class="badge ${m.status === "Active" ? "success" : "neutral"}">${m.status}</span></td>
                                    <td style="text-align: right;">
                                        <div class="action-menu">
                                            <button class="button small ghost" type="button" data-action="edit-member" data-member-id="${m.id}" aria-label="Edit member">
                                                <i data-lucide="edit-3"></i>
                                            </button>
                                            <button class="button small ghost" type="button" data-action="toggle-status" data-member-id="${m.id}" aria-label="${m.status === "Active" ? "Deactivate" : "Activate"}">
                                                <i data-lucide="${m.status === "Active" ? "user-x" : "user-check"}"></i>
                                            </button>
                                            <button class="button small ghost danger" type="button" data-action="remove-member" data-member-id="${m.id}" aria-label="Remove member">
                                                <i data-lucide="trash-2"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    _formatPermission(p) {
        const labels = {
            admin: "Admin",
            financial: "Financial",
            schedule: "Schedule",
            documents: "Documents",
            field: "Field Ops",
            reports: "Reports"
        };
        return labels[p] || p;
    }

    bind({ route, params }) {
        const main = document.getElementById("app-main");

        // Tab switching
        main.querySelectorAll(".tab-button").forEach(btn => {
            btn.addEventListener("click", () => {
                main.querySelectorAll(".tab-button").forEach(b => {
                    b.classList.remove("active");
                    b.setAttribute("aria-selected", "false");
                });
                btn.classList.add("active");
                btn.setAttribute("aria-selected", "true");
                this.currentTab = btn.dataset.tab;
                this._refreshContent();
            });
        });

        // Search
        const searchInput = main.querySelector("#member-search");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                this.searchTerm = e.target.value;
                this._refreshContent();
            });
        }

        // Add member
        document.getElementById("btn-add-member")?.addEventListener("click", () => this._openAddMember());
        document.getElementById("btn-add-first-member")?.addEventListener("click", () => this._openAddMember());

        // Member actions
        main.querySelectorAll("[data-action='edit-member']").forEach(btn => {
            btn.addEventListener("click", () => {
                const memberId = btn.dataset.memberId;
                const member = getProjectMembers().find(m => m.id === memberId);
                if (member) this._openEditMember(member);
            });
        });

        main.querySelectorAll("[data-action='toggle-status']").forEach(btn => {
            btn.addEventListener("click", () => {
                const memberId = btn.dataset.memberId;
                this._toggleMemberStatus(memberId);
            });
        });

        main.querySelectorAll("[data-action='remove-member']").forEach(btn => {
            btn.addEventListener("click", () => {
                const memberId = btn.dataset.memberId;
                this._removeMember(memberId);
            });
        });

        window.lucide?.createIcons();
    }

    _refreshContent() {
        const content = document.getElementById("members-content");
        if (content) {
            const projectId = getCurrentProjectId();
            const members = getProjectMembers().filter(m => m.projectId === projectId);
            const activeMembers = members.filter(m => m.status === "Active");
            const inactiveMembers = members.filter(m => m.status === "Inactive");
            content.innerHTML = this._renderMemberList(this.currentTab, members, activeMembers, inactiveMembers);
            this._bindActions();
            window.lucide?.createIcons();
        }
    }

    _bindActions() {
        const main = document.getElementById("app-main");

        main.querySelectorAll("[data-action='edit-member']").forEach(btn => {
            btn.addEventListener("click", () => {
                const memberId = btn.dataset.memberId;
                const member = getProjectMembers().find(m => m.id === memberId);
                if (member) this._openEditMember(member);
            });
        });

        main.querySelectorAll("[data-action='toggle-status']").forEach(btn => {
            btn.addEventListener("click", () => this._toggleMemberStatus(btn.dataset.memberId));
        });

        main.querySelectorAll("[data-action='remove-member']").forEach(btn => {
            btn.addEventListener("click", () => this._removeMember(btn.dataset.memberId));
        });
    }

    _openAddMember() {
        const users = recordStore.getContacts();
        const projectId = getCurrentProjectId();
        const existingIds = getProjectMembers().filter(m => m.projectId === projectId).map(m => m.email.toLowerCase());
        const availableUsers = users.filter(u => !existingIds.includes(u.email.toLowerCase()));

        const body = `
            <form id="form-add-member" class="record-form">
                <div class="field">
                    <label for="member-source">Member Source</label>
                    <select class="select" id="member-source" name="source" required>
                        <option value="directory">Select from Project Directory</option>
                        <option value="manual">Add New Person (Not in Directory)</option>
                    </select>
                </div>

                <div id="member-directory-fields">
                    <div class="field">
                        <label for="member-select">Select Person</label>
                        <select class="select" id="member-select" name="selectedUser" required>
                            <option value="">-- Choose team member --</option>
                            ${availableUsers.map(u => `
                                <option value="${u.email}" data-name="${u.name}" data-company="${u.company}" data-role="${u.role}" data-discipline="${u.discipline}" data-avatar="${u.avatar}">
                                    ${u.name} — ${u.role} @ ${u.company}
                                </option>
                            `).join("")}
                        </select>
                    </div>
                </div>

                <div id="member-manual-fields" style="display: none;">
                    <div class="form-grid">
                        <div class="field">
                            <label for="m-name">Full Name *</label>
                            <input class="input" id="m-name" name="name" required placeholder="e.g. Alex Morgan">
                        </div>
                        <div class="field">
                            <label for="m-email">Email *</label>
                            <input class="input" id="m-email" name="email" type="email" required placeholder="alex@company.com">
                        </div>
                    </div>
                    <div class="form-grid">
                        <div class="field">
                            <label for="m-company">Company *</label>
                            <input class="input" id="m-company" name="company" required placeholder="e.g. Apex Construction">
                        </div>
                        <div class="field">
                            <label for="m-role">Role *</label>
                            <select class="select" id="m-role" name="role" required>
                                <option value="">Select Role</option>
                                ${PROJECT_ROLES.map(r => `<option value="${r}">${r}</option>`).join("")}
                            </select>
                        </div>
                    </div>
                    <div class="form-grid">
                        <div class="field">
                            <label for="m-discipline">Discipline</label>
                            <select class="select" id="m-discipline" name="discipline">
                                <option value="General Contractor">General Contractor</option>
                                <option value="Architectural">Architectural</option>
                                <option value="Structural">Structural</option>
                                <option value="Mechanical">Mechanical</option>
                                <option value="Electrical">Electrical</option>
                                <option value="Plumbing">Plumbing</option>
                                <option value="Civil">Civil</option>
                                <option value="Owner">Owner</option>
                                <option value="Consultant">Consultant</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="field">
                            <label for="m-avatar">Avatar Initials</label>
                            <input class="input" id="m-avatar" name="avatar" maxlength="2" placeholder="AM">
                        </div>
                    </div>
                </div>

                <div class="settings-section-label">Project Role & Permissions</div>
                <div class="field">
                    <label for="m-project-role">Project Role *</label>
                    <select class="select" id="m-project-role" name="projectRole" required>
                        <option value="">Select Project Role</option>
                        ${PROJECT_ROLES.map(r => `<option value="${r}">${r}</option>`).join("")}
                    </select>
                </div>

                <fieldset class="permission-fieldset">
                    <legend>Module Permissions</legend>
                    <div class="permission-grid">
                        ${[
                            { id: "admin", label: "Full Admin", desc: "All access including settings & user management" },
                            { id: "financial", label: "Financials", desc: "Budgets, contracts, invoices, pay apps, forecasting" },
                            { id: "schedule", label: "Schedule", desc: "CPM schedule, lookaheads, milestone tracking" },
                            { id: "documents", label: "Documents", desc: "RFIs, submittals, drawings, specs, change events" },
                            { id: "field", label: "Field Operations", desc: "Daily logs, punch list, safety, inspections, manpower" },
                            { id: "reports", label: "Reports", desc: "Executive dashboards, analytics, exports" }
                        ].map(p => `
                            <label class="permission-checkbox">
                                <input type="checkbox" name="permissions" value="${p.id}">
                                <span class="perm-check"><i data-lucide="check"></i></span>
                                <div>
                                    <strong>${p.label}</strong>
                                    <span class="perm-desc">${p.desc}</span>
                                </div>
                            </label>
                        `).join("")}
                    </div>
                </fieldset>

                <div class="split" style="margin-top: 0.75rem;">
                    <span></span>
                    <button class="button primary" type="submit"><i data-lucide="user-plus"></i> Add to Project</button>
                </div>
            </form>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "Add Project Team Member",
                body,
                onSubmit: (vals) => this._handleAddMember(vals)
            }
        }));

        setTimeout(() => {
            const sourceSelect = document.getElementById("member-source");
            const dirFields = document.getElementById("member-directory-fields");
            const manualFields = document.getElementById("member-manual-fields");
            const selectEl = document.getElementById("member-select");

            sourceSelect?.addEventListener("change", (e) => {
                if (e.target.value === "directory") {
                    dirFields.style.display = "";
                    manualFields.style.display = "none";
                } else {
                    dirFields.style.display = "none";
                    manualFields.style.display = "";
                }
            });

            selectEl?.addEventListener("change", (e) => {
                const opt = e.target.selectedOptions[0];
                if (opt.value) {
                    document.getElementById("m-name")?.value = opt.dataset.name || "";
                    document.getElementById("m-email")?.value = opt.value;
                    document.getElementById("m-company")?.value = opt.dataset.company || "";
                    document.getElementById("m-role")?.value = opt.dataset.role || "";
                    document.getElementById("m-discipline")?.value = opt.dataset.discipline || "";
                    document.getElementById("m-avatar")?.value = opt.dataset.avatar || "";
                    document.getElementById("m-project-role")?.value = opt.dataset.role || "Project Team Member";
                }
            });

            window.lucide?.createIcons();
        }, 50);
    }

    _handleAddMember(vals) {
        const projectId = getCurrentProjectId();
        let memberData = {
            projectId,
            permissions: vals.permissions || ["documents"],
            assignedDate: new Date().toISOString().split("T")[0],
            status: "Active"
        };

        if (vals.source === "directory" && vals.selectedUser) {
            const user = recordStore.getContacts().find(u => u.email === vals.selectedUser);
            if (user) {
                memberData = {
                    ...memberData,
                    userId: user.id || `usr-${Date.now()}`,
                    name: user.name,
                    email: user.email,
                    company: user.company,
                    role: vals.projectRole || user.role,
                    discipline: user.discipline,
                    avatar: user.avatar || user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                };
            }
        } else {
            memberData = {
                ...memberData,
                userId: `usr-${Date.now()}`,
                name: vals.name,
                email: vals.email,
                company: vals.company,
                role: vals.projectRole || vals.role,
                discipline: vals.discipline || "General",
                avatar: vals.avatar || vals.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
            };
        }

        const all = getProjectMembers();
        all.unshift({ ...memberData, id: `pm-${Date.now()}` });
        setProjectMembers(all);

        document.dispatchEvent(new CustomEvent("toast", { detail: `${memberData.name} added to project team` }));
        this._refreshContent();
    }

    _openEditMember(member) {
        const body = `
            <form id="form-edit-member" class="record-form">
                <input type="hidden" name="memberId" value="${member.id}">

                <div class="form-grid">
                    <div class="field">
                        <label>Name</label>
                        <input class="input" value="${member.name}" disabled>
                    </div>
                    <div class="field">
                        <label>Email</label>
                        <input class="input" value="${member.email}" disabled>
                    </div>
                </div>

                <div class="form-grid">
                    <div class="field">
                        <label>Company</label>
                        <input class="input" value="${member.company}" disabled>
                    </div>
                    <div class="field">
                        <label for="em-project-role">Project Role *</label>
                        <select class="select" id="em-project-role" name="projectRole" required>
                            ${PROJECT_ROLES.map(r => `<option value="${r}"${member.role === r ? " selected" : ""}>${r}</option>`).join("")}
                        </select>
                    </div>
                </div>

                <div class="settings-section-label">Module Permissions</div>
                <fieldset class="permission-fieldset">
                    <div class="permission-grid">
                        ${[
                            { id: "admin", label: "Full Admin", desc: "All access including settings & user management" },
                            { id: "financial", label: "Financials", desc: "Budgets, contracts, invoices, pay apps, forecasting" },
                            { id: "schedule", label: "Schedule", desc: "CPM schedule, lookaheads, milestone tracking" },
                            { id: "documents", label: "Documents", desc: "RFIs, submittals, drawings, specs, change events" },
                            { id: "field", label: "Field Operations", desc: "Daily logs, punch list, safety, inspections, manpower" },
                            { id: "reports", label: "Reports", desc: "Executive dashboards, analytics, exports" }
                        ].map(p => `
                            <label class="permission-checkbox">
                                <input type="checkbox" name="permissions" value="${p.id}" ${member.permissions?.includes(p.id) ? "checked" : ""}>
                                <span class="perm-check"><i data-lucide="check"></i></span>
                                <div>
                                    <strong>${p.label}</strong>
                                    <span class="perm-desc">${p.desc}</span>
                                </div>
                            </label>
                        `).join("")}
                    </div>
                </fieldset>

                <div class="split" style="margin-top: 0.75rem;">
                    <span></span>
                    <button class="button primary" type="submit"><i data-lucide="save"></i> Save Changes</button>
                </div>
            </form>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: `Edit ${member.name} — Project Role & Permissions`,
                body,
                onSubmit: (vals) => this._handleEditMember(member.id, vals)
            }
        }));

        setTimeout(() => window.lucide?.createIcons(), 50);
    }

    _handleEditMember(memberId, vals) {
        const all = getProjectMembers().map(m => {
            if (m.id !== memberId) return m;
            return { ...m, role: vals.projectRole, permissions: vals.permissions || [] };
        });
        setProjectMembers(all);
        document.dispatchEvent(new CustomEvent("toast", { detail: "Member updated" }));
        this._refreshContent();
    }

    _toggleMemberStatus(memberId) {
        const all = getProjectMembers().map(m => {
            if (m.id !== memberId) return m;
            return { ...m, status: m.status === "Active" ? "Inactive" : "Active" };
        });
        setProjectMembers(all);
        document.dispatchEvent(new CustomEvent("toast", { detail: "Member status updated" }));
        this._refreshContent();
    }

    _removeMember(memberId) {
        if (!confirm("Remove this member from the project? This action cannot be undone.")) return;

        const all = getProjectMembers().filter(m => m.id !== memberId);
        setProjectMembers(all);
        document.dispatchEvent(new CustomEvent("toast", { detail: "Member removed from project" }));
        this._refreshContent();
    }
}

function getProjectMembers() {
    const stored = localStorage.getItem(PROJECT_MEMBERS_KEY);
    if (!stored) {
        localStorage.setItem(PROJECT_MEMBERS_KEY, JSON.stringify(SEED_PROJECT_MEMBERS));
        return [...SEED_PROJECT_MEMBERS];
    }
    try {
        return JSON.parse(stored);
    } catch {
        localStorage.setItem(PROJECT_MEMBERS_KEY, JSON.stringify(SEED_PROJECT_MEMBERS));
        return [...SEED_PROJECT_MEMBERS];
    }
}

function setProjectMembers(data) {
    localStorage.setItem(PROJECT_MEMBERS_KEY, JSON.stringify(data));
    document.dispatchEvent(new CustomEvent("project-members-changed"));
}

function getCurrentProjectId() {
    return localStorage.getItem("cm.selectedProject") || "RIV-104";
}