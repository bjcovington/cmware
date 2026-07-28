import { auth } from "../auth.js";
import { Card } from "../components/Card.js";
import { Modal } from "../components/Modal.js";
import { projects } from "../database.js";
import { recordStore } from "../recordStore.js";

export class ProjectPage {
    constructor() {
        this.currentProjectId = null;
        this.teamTab = "team";
    }

    render({ params }) {
        const projectId = params.get("id") || "RIV-104";
        this.currentProjectId = projectId;
        const project = projects.find(p => p.id === projectId) || projects[0];
        const team = auth.getProjectTeam(projectId);
        const availableUsers = auth.getAvailableUsersForProject(projectId);

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Project Directory</span>
                    <h1>${project.name}</h1>
                    <p>${project.address} • ${project.phase} • $${(project.value/1000000).toFixed(1)}M</p>
                </div>
                <div class="toolbar">
                    <button class="button primary" id="btn-add-team-member" type="button"><i data-lucide="user-plus"></i> Add Team Member</button>
                    <button class="button" id="btn-edit-project" type="button"><i data-lucide="edit-3"></i> Edit Project</button>
                </div>
            </section>

            <div class="page-grid">
                <section class="card project-detail-card">
                    <div class="card-header">
                        <div>
                            <div class="eyebrow">Project Details</div>
                            <h2>Overview</h2>
                        </div>
                    </div>
                    <div class="project-detail-grid">
                        <div class="detail-group">
                            <h3>Basic Information</h3>
                            <dl class="detail-list">
                                <dt>Project Number</dt><dd>${project.number}</dd>
                                <dt>Project ID</dt><dd>${project.id}</dd>
                                <dt>Address</dt><dd>${project.address}</dd>
                                <dt>Current Phase</dt><dd><span class="badge info">${project.phase}</span></dd>
                                <dt>Square Footage</dt><dd>${project.squareFeet.toLocaleString()} SF</dd>
                                <dt>Contract Value</dt><dd>$${project.value.toLocaleString()}</dd>
                            </dl>
                        </div>
                        <div class="detail-group">
                            <h3>Schedule</h3>
                            <dl class="detail-list">
                                <dt>Start Date</dt><dd>${project.startDate}</dd>
                                <dt>Completion Date</dt><dd>${project.completionDate}</dd>
                            </dl>
                        </div>
                        <div class="detail-group">
                            <h3>Key Parties</h3>
                            <dl class="detail-list">
                                <dt>Owner</dt><dd>${project.owner}</dd>
                                <dt>Architect</dt><dd>${project.architect}</dd>
                                <dt>General Contractor</dt><dd>${project.generalContractor}</dd>
                            </dl>
                        </div>
                    </div>
                </section>

                <section class="card">
                    <div class="card-header">
                        <div>
                            <div class="eyebrow">Team Directory</div>
                            <h2>Project Team (${team.length} members)</h2>
                        </div>
                        <div class="toolbar">
                            <select class="select" id="team-filter-role">
                                <option value="">All Roles</option>
                                <option value="Project Executive">Project Executive</option>
                                <option value="Project Manager">Project Manager</option>
                                <option value="Project Engineer">Project Engineer</option>
                                <option value="Superintendent">Superintendent</option>
                                <option value="Architect">Architect</option>
                                <option value="Engineer">Engineer</option>
                                <option value="Owner Rep">Owner Representative</option>
                                <option value="Subcontractor">Subcontractor</option>
                                <option value="Other">Other</option>
                            </select>
                            <input class="input" id="team-search" type="search" placeholder="Search team..." style="max-width:200px;">
                        </div>
                    </div>
                    <div id="project-team-content">
                        ${this.renderTeamTable(team)}
                    </div>
                </section>
            </div>
        `;
    }

    renderTeamTable(team) {
        if (!team.length) {
            return `
                <div class="empty-state">
                    <i data-lucide="users" class="empty-icon"></i>
                    <h3>No team members yet</h3>
                    <p>Add project team members to enable collaboration, notifications, and access control.</p>
                    <button class="button primary" id="btn-add-first-member"><i data-lucide="user-plus"></i> Add First Team Member</button>
                </div>
            `;
        }

        return `
            <div class="table-wrap">
                <table class="data-table" id="team-table">
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Role</th>
                            <th>Company</th>
                            <th>Access Level</th>
                            <th>Added</th>
                            <th style="text-align:right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${team.map(m => `
                            <tr data-member-id="${m.id}">
                                <td>
                                    <div class="table-title-cell">
                                        <div class="avatar-circle small">${m.avatar}</div>
                                        <div>
                                            <span class="cell-title">${m.name}</span>
                                            <span class="cell-subtext">${m.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td><span class="badge neutral">${m.role}</span></td>
                                <td>${m.company}</td>
                                <td><span class="badge ${this.getAccessBadge(m.accessLevel)}">${m.accessLevel}</span></td>
                                <td>${m.addedAt}</td>
                                <td style="text-align:right;">
                                    <div class="action-menu">
                                        <button class="button ghost small" data-action="edit-member" data-member-id="${m.id}" type="button"><i data-lucide="edit-3"></i></button>
                                        <button class="button ghost small danger" data-action="remove-member" data-member-id="${m.id}" type="button"><i data-lucide="trash-2"></i></button>
                                    </div>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    getAccessBadge(level) {
        const badges = {
            "Full Access": "success",
            "Read/Write": "info",
            "Read Only": "neutral",
            "Financial Read Only": "warning",
            "Field Only": "info",
            "Admin Only": "danger"
        };
        return badges[level] || "neutral";
    }

    bind({ route, params }) {
        this.currentProjectId = params.get("id") || "RIV-104";

        // Add team member button
        document.getElementById("btn-add-team-member")?.addEventListener("click", () => this.openAddMemberModal());
        document.getElementById("btn-add-first-member")?.addEventListener("click", () => this.openAddMemberModal());
        document.getElementById("btn-edit-project")?.addEventListener("click", () => this.openEditProjectModal());

        // Team table actions
        document.getElementById("team-table")?.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-action]");
            if (!btn) return;
            const memberId = btn.dataset.memberId;
            if (btn.dataset.action === "edit-member") this.openEditMemberModal(memberId);
            if (btn.dataset.action === "remove-member") this.confirmRemoveMember(memberId);
        });

        // Filter/search
        document.getElementById("team-filter-role")?.addEventListener("change", () => this.filterTeam());
        document.getElementById("team-search")?.addEventListener("input", () => this.filterTeam());
    }

    filterTeam() {
        const roleFilter = document.getElementById("team-filter-role")?.value || "";
        const search = (document.getElementById("team-search")?.value || "").toLowerCase();
        const team = auth.getProjectTeam(this.currentProjectId);

        const filtered = team.filter(m => {
            const roleMatch = !roleFilter || m.role.includes(roleFilter);
            const searchMatch = !search || m.name.toLowerCase().includes(search) || m.email.toLowerCase().includes(search) || m.company.toLowerCase().includes(search);
            return roleMatch && searchMatch;
        });

        document.getElementById("project-team-content").innerHTML = this.renderTeamTable(filtered);
        window.lucide?.createIcons();
    }

    openAddMemberModal() {
        const availableUsers = auth.getAvailableUsersForProject(this.currentProjectId);
        const roles = auth.getProjectRoles();
        const accessLevels = auth.getProjectAccessLevels();

        const userOptions = availableUsers.map(u => `<option value="${u.id}">${u.name} (${u.company}) - ${u.role}</option>`).join("");
        const roleOptions = roles.map(r => `<option value="${r}">${r}</option>`).join("");
        const accessOptions = accessLevels.map(a => `<option value="${a}">${a}</option>`).join("");

        const body = `
            <form id="form-add-member" class="record-form">
                <div class="field">
                    <label for="am-user">Select User</label>
                    <select class="select" id="am-user" name="userId" required>
                        <option value="">-- Choose a user --</option>
                        ${userOptions}
                    </select>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="am-role">Project Role</label>
                        <select class="select" id="am-role" name="role" required>
                            <option value="">-- Select Role --</option>
                            ${roleOptions}
                        </select>
                    </div>
                    <div class="field">
                        <label for="am-access">Access Level</label>
                        <select class="select" id="am-access" name="accessLevel" required>
                            ${accessOptions}
                        </select>
                    </div>
                </div>
                <div class="split" style="margin-top:0.75rem;">
                    <span></span>
                    <button class="button primary" type="submit"><i data-lucide="check"></i> Add Team Member</button>
                </div>
            </form>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "Add Project Team Member",
                body,
                onSubmit: (vals) => {
                    const user = auth.getUsers().find(u => u.id === vals.userId);
                    if (!user) return;
                    auth.addProjectTeamMember(this.currentProjectId, {
                        userId: user.id,
                        name: user.name,
                        email: user.email,
                        company: user.company,
                        role: vals.role,
                        avatar: user.avatar,
                        accessLevel: vals.accessLevel
                    });
                    document.dispatchEvent(new CustomEvent("toast", { detail: `${user.name} added to project team` }));
                    this.refreshTeamView();
                }
            }
        }));
    }

    openEditMemberModal(memberId) {
        const team = auth.getProjectTeam(this.currentProjectId);
        const member = team.find(m => m.id === memberId);
        if (!member) return;

        const roles = auth.getProjectRoles();
        const accessLevels = auth.getProjectAccessLevels();
        const roleOptions = roles.map(r => `<option value="${r}" ${r === member.role ? "selected" : ""}>${r}</option>`).join("");
        const accessOptions = accessLevels.map(a => `<option value="${a}" ${a === member.accessLevel ? "selected" : ""}>${a}</option>`).join("");

        const body = `
            <form id="form-edit-member" class="record-form">
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
                        <label for="em-role">Project Role</label>
                        <select class="select" id="em-role" name="role" required>
                            ${roleOptions}
                        </select>
                    </div>
                </div>
                <div class="field">
                    <label for="em-access">Access Level</label>
                    <select class="select" id="em-access" name="accessLevel" required>
                        ${accessOptions}
                    </select>
                </div>
                <div class="split" style="margin-top:0.75rem;">
                    <span class="muted">Added: ${member.addedAt} by ${member.addedBy}</span>
                    <button class="button primary" type="submit"><i data-lucide="save"></i> Save Changes</button>
                </div>
            </form>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: `Edit ${member.name}`,
                body,
                onSubmit: (vals) => {
                    auth.updateProjectTeamMember(this.currentProjectId, memberId, vals);
                    document.dispatchEvent(new CustomEvent("toast", { detail: `${member.name} updated` }));
                    this.refreshTeamView();
                }
            }
        }));
    }

    confirmRemoveMember(memberId) {
        const team = auth.getProjectTeam(this.currentProjectId);
        const member = team.find(m => m.id === memberId);
        if (!member) return;

        const body = `
            <div class="confirm-dialog">
                <i data-lucide="alert-triangle" class="confirm-icon warning"></i>
                <h3>Remove Team Member?</h3>
                <p>This will remove <strong>${member.name}</strong> (${member.role}) from the project team. They will lose access to this project.</p>
                <div class="split" style="margin-top:1rem;">
                    <button class="button" id="btn-cancel-remove" type="button">Cancel</button>
                    <button class="button danger" id="btn-confirm-remove" type="button">Remove Member</button>
                </div>
            </div>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "Confirm Removal",
                body,
                onSubmit: null
            }
        }));

        setTimeout(() => {
            document.getElementById("btn-confirm-remove")?.addEventListener("click", () => {
                auth.removeProjectTeamMember(this.currentProjectId, memberId);
                document.dispatchEvent(new CustomEvent("toast", { detail: `${member.name} removed from project team` }));
                document.getElementById("modal-close")?.click();
                this.refreshTeamView();
            });
            document.getElementById("btn-cancel-remove")?.addEventListener("click", () => document.getElementById("modal-close")?.click());
            window.lucide?.createIcons();
        }, 50);
    }

    openEditProjectModal() {
        const project = projects.find(p => p.id === this.currentProjectId) || projects[0];
        const body = `
            <form id="form-edit-project" class="record-form">
                <div class="form-grid">
                    <div class="field">
                        <label for="ep-name">Project Name</label>
                        <input class="input" id="ep-name" name="name" value="${project.name}" required>
                    </div>
                    <div class="field">
                        <label for="ep-number">Project Number</label>
                        <input class="input" id="ep-number" name="number" value="${project.number}" required>
                    </div>
                </div>
                <div class="field">
                    <label for="ep-address">Address</label>
                    <input class="input" id="ep-address" name="address" value="${project.address}" required>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="ep-phase">Current Phase</label>
                        <input class="input" id="ep-phase" name="phase" value="${project.phase}" required>
                    </div>
                    <div class="field">
                        <label for="ep-sqft">Square Footage</label>
                        <input class="input" id="ep-sqft" name="squareFeet" type="number" value="${project.squareFeet}" required>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="ep-value">Contract Value ($)</label>
                        <input class="input" id="ep-value" name="value" type="number" value="${project.value}" required>
                    </div>
                    <div class="field">
                        <label for="ep-start">Start Date</label>
                        <input class="input" id="ep-start" name="startDate" type="date" value="${project.startDate}" required>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="ep-complete">Completion Date</label>
                        <input class="input" id="ep-complete" name="completionDate" type="date" value="${project.completionDate}" required>
                    </div>
                    <div class="field">
                        <label for="ep-owner">Owner</label>
                        <input class="input" id="ep-owner" name="owner" value="${project.owner}" required>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="ep-arch">Architect</label>
                        <input class="input" id="ep-arch" name="architect" value="${project.architect}" required>
                    </div>
                    <div class="field">
                        <label for="ep-gc">General Contractor</label>
                        <input class="input" id="ep-gc" name="generalContractor" value="${project.generalContractor}" required>
                    </div>
                </div>
                <div class="split" style="margin-top:0.75rem;">
                    <span></span>
                    <button class="button primary" type="submit"><i data-lucide="save"></i> Save Changes</button>
                </div>
            </form>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "Edit Project Details",
                body,
                onSubmit: (vals) => {
                    recordStore.updateProject(this.currentProjectId, vals);
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Project updated" }));
                    location.hash = `#/project?id=${this.currentProjectId}`;
                }
            }
        }));
    }

    refreshTeamView() {
        const team = auth.getProjectTeam(this.currentProjectId);
        document.getElementById("project-team-content").innerHTML = this.renderTeamTable(team);
        window.lucide?.createIcons();
        this.bind({});
    }
}