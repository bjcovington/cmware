import { recordStore } from "../recordStore.js";
import { Card } from "../components/Card.js";
import { Tabs } from "../components/Tabs.js";

const PROJECT_TABS = ["Projects", "Create Project", "Team Management"];

export class Projects {
    constructor() {
        this.currentTab = PROJECT_TABS[0];
    }

    render({ params }) {
        this.currentTab = params.get("tab") || PROJECT_TABS[0];
        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Project Controls</span>
                    <h1>Projects & Team Management</h1>
                    <p>Create projects, manage team members, assign roles and permissions</p>
                </div>
            </section>

            ${Tabs.render(PROJECT_TABS, this.currentTab)}

            <div id="projects-tab-content">
                ${this._renderTab(this.currentTab)}
            </div>
        `;
    }

    _renderTab(tab) {
        if (tab === "Projects") return this._renderProjectsList();
        if (tab === "Create Project") return this._renderCreateProject();
        if (tab === "Team Management") return this._renderTeamManagement();
        return "";
    }

    _renderProjectsList() {
        const projects = recordStore.getProjects();
        return `
            <div class="card-grid" style="grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));">
                ${projects.map((p) => `
                    <section class="card project-card" data-project-id="${p.id}">
                        <div class="card-header">
                            <div>
                                <div class="eyebrow">${p.phase}</div>
                                <h2 class="card-title">${p.name}</h2>
                                <div class="project-meta">
                                    <span>${p.number}</span>
                                    <span>${p.address}</span>
                                </div>
                            </div>
                        </div>
                        <div class="project-stats">
                            <div class="stat">
                                <span class="stat-value">${this._money(p.value)}</span>
                                <span class="stat-label">Contract Value</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${p.squareFeet.toLocaleString()}</span>
                                <span class="stat-label">SF</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${this._formatDate(p.startDate)}</span>
                                <span class="stat-label">Start</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${this._formatDate(p.completionDate)}</span>
                                <span class="stat-label">Complete</span>
                            </div>
                        </div>
                        <div class="project-meta-row">
                            <div><strong>Owner:</strong> ${p.owner}</div>
                            <div><strong>Architect:</strong> ${p.architect}</div>
                            <div><strong>GC:</strong> ${p.generalContractor}</div>
                        </div>
                        <div class="card-actions" style="margin-top:1rem;display:flex;gap:0.5rem;">
                            <button class="button primary" data-action="select-project" data-project-id="${p.id}" type="button">
                                <i data-lucide="arrow-right"></i> Open Project
                            </button>
                            <button class="button secondary" data-action="edit-project" data-project-id="${p.id}" type="button">
                                <i data-lucide="edit-3"></i> Edit
                            </button>
                        </div>
                    </section>
                `).join("")}
            </div>
        `;
    }

    _renderCreateProject() {
        return `
            <form id="form-create-project" class="record-form" style="max-width: 900px;">
                <div class="form-header">
                    <h2>Create New Project</h2>
                    <p class="muted">Enter project details to initialize a new construction project</p>
                </div>

                <div class="settings-section-label">Project Identification</div>
                <div class="form-grid">
                    <div class="field">
                        <label for="prj-name">Project Name</label>
                        <input class="input" id="prj-name" name="name" required placeholder="e.g. Riverside Medical Center">
                    </div>
                    <div class="field">
                        <label for="prj-number">Project Number</label>
                        <input class="input" id="prj-number" name="number" required placeholder="e.g. PRJ-2026-04">
                    </div>
                </div>

                <div class="settings-section-label" style="margin-top:1.25rem;">Location & Schedule</div>
                <div class="form-grid">
                    <div class="field">
                        <label for="prj-address">Address</label>
                        <input class="input" id="prj-address" name="address" required placeholder="1450 River Park Blvd, Suite 300, Chicago, IL">
                    </div>
                    <div class="field">
                        <label for="prj-phase">Current Phase</label>
                        <select class="select" id="prj-phase" name="phase" required>
                            <option value="Pre-Construction">Pre-Construction</option>
                            <option value="Groundwork & Foundation">Groundwork & Foundation</option>
                            <option value="Structural Steel Framing">Structural Steel Framing</option>
                            <option value="Envelope & Roofing">Envelope & Roofing</option>
                            <option value="Interior Buildout & Finishes">Interior Buildout & Finishes</option>
                            <option value="MEP Rough-in & Trim">MEP Rough-in & Trim</option>
                            <option value="Testing & Commissioning">Testing & Commissioning</option>
                            <option value="Closeout & Commissioning">Closeout & Commissioning</option>
                        </select>
                    </div>
                    <div class="field">
                        <label for="prj-start">Start Date</label>
                        <input class="input" id="prj-start" name="startDate" type="date" required>
                    </div>
                    <div class="field">
                        <label for="prj-complete">Estimated Completion</label>
                        <input class="input" id="prj-complete" name="completionDate" type="date" required>
                    </div>
                </div>

                <div class="settings-section-label" style="margin-top:1.25rem;">Contract & Metrics</div>
                <div class="form-grid">
                    <div class="field">
                        <label for="prj-value">Contract Value ($)</label>
                        <input class="input" id="prj-value" name="value" type="number" min="0" step="1000" required placeholder="48250000">
                    </div>
                    <div class="field">
                        <label for="prj-sf">Square Footage</label>
                        <input class="input" id="prj-sf" name="squareFeet" type="number" min="0" step="100" required placeholder="215000">
                    </div>
                </div>

                <div class="settings-section-label" style="margin-top:1.25rem;">Key Parties</div>
                <div class="form-grid">
                    <div class="field">
                        <label for="prj-owner">Owner</label>
                        <input class="input" id="prj-owner" name="owner" required placeholder="e.g. Riverside Health Trust">
                    </div>
                    <div class="field">
                        <label for="prj-architect">Architect</label>
                        <input class="input" id="prj-architect" name="architect" required placeholder="e.g. Design Studio International">
                    </div>
                    <div class="field">
                        <label for="prj-gc">General Contractor</label>
                        <input class="input" id="prj-gc" name="generalContractor" required placeholder="e.g. Apex Construction Services">
                    </div>
                </div>

                <div class="split" style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--color-border);">
                    <span class="muted">Initial budget and cost codes will be created after project creation</span>
                    <button class="button primary" type="submit"><i data-lucide="plus-circle"></i> Create Project</button>
                </div>
            </form>
        `;
    }

    _renderTeamManagement() {
        const currentProject = recordStore.getCurrentProject();
        const teamMembers = recordStore.getProjectTeam();
        const allContacts = recordStore.getContacts();
        
        const availableContacts = allContacts.filter(c => 
            !teamMembers.some(tm => tm.contactId === c.id)
        );

        return `
            <div class="form-grid" style="margin-bottom:1.5rem;">
                <div class="field">
                    <label>Current Project</label>
                    <select class="select" id="team-project-select" disabled>
                        <option value="${currentProject?.id}" selected>${currentProject?.name} (${currentProject?.number})</option>
                    </select>
                </div>
                <div class="field">
                    <label>Team Members</label>
                    <span class="badge primary">${teamMembers.length} assigned</span>
                </div>
            </div>

            ${Card.render({
                title: "Project Team Members",
                eyebrow: "Fully editable — add, remove, change roles",
                actions: `<button class="button primary" id="btn-add-team-member" type="button"><i data-lucide="user-plus"></i> Add Team Member</button>`,
                body: teamMembers.length ? `
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Company</th>
                                    <th>Role</th>
                                    <th>Discipline</th>
                                    <th>Access Level</th>
                                    <th>Status</th>
                                    <th style="text-align:right;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${teamMembers.map((tm) => `
                                    <tr data-team-id="${tm.id}">
                                        <td><strong>${tm.name}</strong></td>
                                        <td>${tm.email}</td>
                                        <td>${tm.company}</td>
                                        <td>
                                            <input class="input input-sm" type="text" name="role" value="${tm.role}" 
                                                data-action="update-role" data-team-id="${tm.id}" style="min-width:180px;">
                                        </td>
                                        <td>
                                            <select class="select select-sm" name="discipline" 
                                                data-action="update-discipline" data-team-id="${tm.id}" style="min-width:160px;">
                                                ${["General Contractor","Architect","Structural Engineer","MEP Engineer","Civil Engineer","Owner","Subcontractor","Consultant","Inspector","Other"]
                                                    .map(d => `<option${tm.discipline===d?" selected":""}>${d}</option>`).join("")}
                                            </select>
                                        </td>
                                        <td>
                                            <select class="select select-sm" name="access" 
                                                data-action="update-access" data-team-id="${tm.id}" style="min-width:160px;">
                                                ${["Project Manager","Superintendent","Project Engineer","Field Engineer","Estimator","Accountant","Viewer","Admin"]
                                                    .map(a => `<option${tm.access===a?" selected":""}>${a}</option>`).join("")}
                                            </select>
                                        </td>
                                        <td><span class="badge ${tm.active?"success":"neutral"}">${tm.active?"Active":"Inactive"}</span></td>
                                        <td style="text-align:right;">
                                            <button class="button small ghost" data-action="toggle-active" data-team-id="${tm.id}" type="button">
                                                <i data-lucide="${tm.active?"user-x":"user-check"}"></i>
                                            </button>
                                            <button class="button small ghost danger" data-action="remove-member" data-team-id="${tm.id}" type="button">
                                                <i data-lucide="trash-2"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
                ` : `<div class="empty-inline">No team members assigned yet. Click "Add Team Member" to build your project team.</div>`
            })}

            ${Card.render({
                title: "Available Contacts (not on team)",
                eyebrow: "Add from directory",
                body: availableContacts.length ? `
                    <div class="contact-grid">
                        ${availableContacts.map((c) => `
                            <div class="contact-card-item" data-contact-id="${c.id}">
                                <div class="avatar-circle" style="background:var(--color-primary)">${c.avatar}</div>
                                <div class="contact-meta">
                                    <strong>${c.name}</strong>
                                    <span class="subtext">${c.role} &bull; ${c.company}</span>
                                    <span class="contact-email"><i data-lucide="mail"></i> ${c.email}</span>
                                </div>
                                <button class="button small primary" data-action="add-from-contact" data-contact-id="${c.id}" type="button">
                                    Add to Team
                                </button>
                            </div>
                        `).join("")}
                    </div>
                ` : `<div class="empty-inline">All directory contacts are already on the team. Add new contacts in Settings > Directory.</div>`
            })}
        `;
    }

    bind() {
        const main = document.getElementById("app-main");

        // Tab switching
        main.querySelectorAll(".tab-button").forEach((btn) => {
            btn.addEventListener("click", () => {
                main.querySelectorAll(".tab-button").forEach((b) => {
                    b.classList.remove("active");
                    b.setAttribute("aria-selected", "false");
                });
                btn.classList.add("active");
                btn.setAttribute("aria-selected", "true");
                this.currentTab = btn.dataset.tab || btn.textContent.trim();

                const content = document.getElementById("projects-tab-content");
                if (content) {
                    content.innerHTML = this._renderTab(this.currentTab);
                    window.lucide?.createIcons();
                    this._bindTabActions();
                }
            });
        });

        this._bindTabActions();
    }

    _bindTabActions() {
        const main = document.getElementById("app-main");

        // Create project form
        const createForm = main.querySelector("#form-create-project");
        if (createForm) {
            createForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const formData = new FormData(createForm);
                const project = {
                    id: `PRJ-${Date.now()}`,
                    name: formData.get("name"),
                    number: formData.get("number"),
                    address: formData.get("address"),
                    phase: formData.get("phase"),
                    value: Number(formData.get("value")),
                    squareFeet: Number(formData.get("squareFeet")),
                    startDate: formData.get("startDate"),
                    completionDate: formData.get("completionDate"),
                    owner: formData.get("owner"),
                    architect: formData.get("architect"),
                    generalContractor: formData.get("generalContractor")
                };
                recordStore.addProject(project);
                document.dispatchEvent(new CustomEvent("toast", { detail: `Project "${project.name}" created` }));
                location.hash = "#/projects?tab=Projects";
            });
        }

        // Select project
        main.querySelectorAll("[data-action='select-project']").forEach((btn) => {
            btn.addEventListener("click", () => {
                const projectId = btn.dataset.projectId;
                recordStore.setCurrentProject(projectId);
                document.dispatchEvent(new CustomEvent("toast", { detail: "Project context switched" }));
                location.hash = "#/dashboard";
            });
        });

        // Edit project
        main.querySelectorAll("[data-action='edit-project']").forEach((btn) => {
            btn.addEventListener("click", () => {
                const project = recordStore.getProjects().find(p => p.id === btn.dataset.projectId);
                if (project) this._openEditProject(project);
            });
        });

        // Team management actions
        main.querySelectorAll("[data-action='update-role']").forEach((input) => {
            input.addEventListener("change", () => {
                recordStore.updateTeamMember(input.dataset.teamId, { role: input.value });
                document.dispatchEvent(new CustomEvent("toast", { detail: "Role updated" }));
            });
        });

        main.querySelectorAll("[data-action='update-discipline']").forEach((select) => {
            select.addEventListener("change", () => {
                recordStore.updateTeamMember(select.dataset.teamId, { discipline: select.value });
                document.dispatchEvent(new CustomEvent("toast", { detail: "Discipline updated" }));
            });
        });

        main.querySelectorAll("[data-action='update-access']").forEach((select) => {
            select.addEventListener("change", () => {
                recordStore.updateTeamMember(select.dataset.teamId, { access: select.value });
                document.dispatchEvent(new CustomEvent("toast", { detail: "Access level updated" }));
            });
        });

        main.querySelectorAll("[data-action='toggle-active']").forEach((btn) => {
            btn.addEventListener("click", () => {
                const teamId = btn.dataset.teamId;
                const member = recordStore.getProjectTeam().find(tm => tm.id === teamId);
                if (member) {
                    recordStore.updateTeamMember(teamId, { active: !member.active });
                    document.dispatchEvent(new CustomEvent("toast", { detail: `${member.name} ${!member.active ? "activated" : "deactivated"}` }));
                    location.hash = "#/projects?tab=Team Management";
                }
            });
        });

        main.querySelectorAll("[data-action='remove-member']").forEach((btn) => {
            btn.addEventListener("click", () => {
                if (confirm("Remove this team member from the project?")) {
                    recordStore.removeTeamMember(btn.dataset.teamId);
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Team member removed" }));
                    location.hash = "#/projects?tab=Team Management";
                }
            });
        });

        // Add from contact
        main.querySelectorAll("[data-action='add-from-contact']").forEach((btn) => {
            btn.addEventListener("click", () => {
                const contact = recordStore.getContacts().find(c => c.id === btn.dataset.contactId);
                if (contact) {
                    this._openAddTeamMemberModal(contact);
                }
            });
        });

        // Add team member button
        main.querySelector("#btn-add-team-member")?.addEventListener("click", () => {
            this._openAddTeamMemberModal();
        });
    }

    _openEditProject(project) {
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
                <div class="form-grid">
                    <div class="field">
                        <label for="ep-address">Address</label>
                        <input class="input" id="ep-address" name="address" value="${project.address}" required>
                    </div>
                    <div class="field">
                        <label for="ep-phase">Phase</label>
                        <select class="select" id="ep-phase" name="phase">
                            <option${project.phase==="Pre-Construction"?" selected":""}>Pre-Construction</option>
                            <option${project.phase==="Groundwork & Foundation"?" selected":""}>Groundwork & Foundation</option>
                            <option${project.phase==="Structural Steel Framing"?" selected":""}>Structural Steel Framing</option>
                            <option${project.phase==="Envelope & Roofing"?" selected":""}>Envelope & Roofing</option>
                            <option${project.phase==="Interior Buildout & Finishes"?" selected":""}>Interior Buildout & Finishes</option>
                            <option${project.phase==="MEP Rough-in & Trim"?" selected":""}>MEP Rough-in & Trim</option>
                            <option${project.phase==="Testing & Commissioning"?" selected":""}>Testing & Commissioning</option>
                            <option${project.phase==="Closeout & Commissioning"?" selected":""}>Closeout & Commissioning</option>
                        </select>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="ep-value">Contract Value ($)</label>
                        <input class="input" id="ep-value" name="value" type="number" value="${project.value}" min="0" step="1000">
                    </div>
                    <div class="field">
                        <label for="ep-sf">Square Feet</label>
                        <input class="input" id="ep-sf" name="squareFeet" type="number" value="${project.squareFeet}" min="0" step="100">
                    </div>
                    <div class="field">
                        <label for="ep-start">Start Date</label>
                        <input class="input" id="ep-start" name="startDate" type="date" value="${project.startDate}">
                    </div>
                    <div class="field">
                        <label for="ep-complete">Completion Date</label>
                        <input class="input" id="ep-complete" name="completionDate" type="date" value="${project.completionDate}">
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="ep-owner">Owner</label>
                        <input class="input" id="ep-owner" name="owner" value="${project.owner}">
                    </div>
                    <div class="field">
                        <label for="ep-architect">Architect</label>
                        <input class="input" id="ep-architect" name="architect" value="${project.architect}">
                    </div>
                    <div class="field">
                        <label for="ep-gc">General Contractor</label>
                        <input class="input" id="ep-gc" name="generalContractor" value="${project.generalContractor}">
                    </div>
                </div>
                <div class="split" style="margin-top:1rem;">
                    <span></span>
                    <button class="button primary" type="submit"><i data-lucide="save"></i> Save Changes</button>
                </div>
            </form>
        `;
        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: `Edit ${project.name}`,
                body,
                onSubmit: (vals) => {
                    recordStore.updateProject(project.id, vals);
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Project updated" }));
                    location.hash = "#/projects?tab=Projects";
                }
            }
        }));
    }

    _openAddTeamMemberModal(prefillContact = null) {
        const allContacts = recordStore.getContacts();
        const teamMembers = recordStore.getProjectTeam();
        const availableContacts = prefillContact ? [prefillContact] : allContacts.filter(c => 
            !teamMembers.some(tm => tm.contactId === c.id)
        );

        const body = `
            <form id="form-add-team-member" class="record-form">
                <div class="form-grid">
                    <div class="field">
                        <label for="tm-contact">Select Contact</label>
                        <select class="select" id="tm-contact" name="contactId" required${prefillContact ? " disabled" : ""}>
                            <option value="">-- Choose from directory --</option>
                            ${availableContacts.map(c => `<option value="${c.id}"${prefillContact?" selected":""}>${c.name} — ${c.company} (${c.role})</option>`).join("")}
                        </select>
                    </div>
                    ${prefillContact ? `<input type="hidden" name="contactId" value="${prefillContact.id}">` : ""}
                </div>

                <div class="form-grid">
                    <div class="field">
                        <label for="tm-role">Project Role</label>
                        <input class="input" id="tm-role" name="role" required placeholder="e.g. Project Manager" value="${prefillContact?.role || ''}">
                    </div>
                    <div class="field">
                        <label for="tm-discipline">Discipline</label>
                        <select class="select" id="tm-discipline" name="discipline" required>
                            ${["General Contractor","Architect","Structural Engineer","MEP Engineer","Civil Engineer","Owner","Subcontractor","Consultant","Inspector","Other"]
                                .map(d => `<option${prefillContact?.discipline===d?" selected":""}>${d}</option>`).join("")}
                        </select>
                    </div>
                </div>

                <div class="form-grid">
                    <div class="field">
                        <label for="tm-access">Access Level</label>
                        <select class="select" id="tm-access" name="access" required>
                            ${["Project Manager","Superintendent","Project Engineer","Field Engineer","Estimator","Accountant","Viewer","Admin"]
                                .map(a => `<option${a==="Project Engineer"?" selected":""}>${a}</option>`).join("")}
                        </select>
                    </div>
                    <div class="field">
                        <label for="tm-active">Status</label>
                        <select class="select" id="tm-active" name="active">
                            <option value="true" selected>Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                </div>

                <div class="split" style="margin-top:1rem;">
                    <span></span>
                    <button class="button primary" type="submit"><i data-lucide="user-plus"></i> Add to Team</button>
                </div>
            </form>
        `;
        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: prefillContact ? `Add ${prefillContact.name} to Project Team` : "Add Team Member",
                body,
                onSubmit: (vals) => {
                    const contact = recordStore.getContacts().find(c => c.id === vals.contactId);
                    if (!contact) return;
                    
                    recordStore.addTeamMember({
                        contactId: contact.id,
                        name: contact.name,
                        email: contact.email,
                        company: contact.company,
                        role: vals.role,
                        discipline: vals.discipline,
                        access: vals.access,
                        active: vals.active === "true"
                    });
                    document.dispatchEvent(new CustomEvent("toast", { detail: `${contact.name} added to team` }));
                    location.hash = "#/projects?tab=Team Management";
                }
            }
        }));
    }

    _money(val) {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val || 0);
    }

    _formatDate(dateStr) {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
}