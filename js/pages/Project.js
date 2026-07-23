import { recordStore } from "../recordStore.js";
import { Card } from "../components/Card.js";
import { Button } from "../components/Button.js";

export class Project {
    render() {
        const proj = recordStore.getProjectInfo();
        const contacts = recordStore.getContacts();

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Project Overview</span>
                    <h1>${proj.name}</h1>
                    <p>Contract controls, executive specifications, schedule milestones, and key directory team contacts.</p>
                </div>
                <div class="toolbar">
                    <button class="button primary" id="btn-edit-project-info" type="button"><i data-lucide="edit"></i> Edit Project Info</button>
                    <button class="button" onclick="window.print()" type="button"><i data-lucide="printer"></i> Print Datasheet</button>
                </div>
            </section>

            <div class="dashboard-grid">
                <div class="stack">
                    ${Card.render({
                        title: "Project Parameters & Contract Data",
                        eyebrow: "Project Details",
                        body: `
                            <div class="detail-meta-grid">
                                <div class="meta-card"><span class="meta-label">Project Name</span><strong>${proj.name}</strong></div>
                                <div class="meta-card"><span class="meta-label">Project Number</span><strong>${proj.number}</strong></div>
                                <div class="meta-card"><span class="meta-label">Site Address</span><strong>${proj.address}</strong></div>
                                <div class="meta-card"><span class="meta-label">Current Phase</span><strong>${proj.phase}</strong></div>
                                <div class="meta-card"><span class="meta-label">Contract Value</span><strong class="text-success">$${(proj.value || 0).toLocaleString()}</strong></div>
                                <div class="meta-card"><span class="meta-label">Square Feet</span><strong>${(proj.squareFeet || 0).toLocaleString()} SF</strong></div>
                                <div class="meta-card"><span class="meta-label">Start Date</span><strong>${proj.startDate}</strong></div>
                                <div class="meta-card"><span class="meta-label">Target Completion</span><strong>${proj.completionDate}</strong></div>
                            </div>
                        `
                    })}

                    ${Card.render({
                        title: "Primary Contracting Entities",
                        eyebrow: "Project Team",
                        body: `
                            <div class="stack">
                                <div class="split"><strong>General Contractor:</strong> <span>${proj.generalContractor}</span></div>
                                <div class="split"><strong>Lead Architect:</strong> <span>${proj.architect}</span></div>
                                <div class="split"><strong>Project Owner:</strong> <span>${proj.owner}</span></div>
                            </div>
                        `
                    })}
                </div>

                <div class="stack">
                    ${Card.render({
                        title: "Key Project Directory Contacts",
                        eyebrow: "Contacts Summary",
                        body: `
                            <div class="stack">
                                ${contacts.slice(0, 4).map((c) => `
                                    <div class="contact-card-item">
                                        <div class="avatar-circle">${c.avatar}</div>
                                        <div class="contact-meta">
                                            <strong>${c.name}</strong>
                                            <span class="subtext">${c.role} &bull; ${c.company}</span>
                                            <span class="contact-email"><i data-lucide="mail"></i> ${c.email}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `
                    })}
                </div>
            </div>
        `;
    }

    bind() {
        const proj = recordStore.getProjectInfo();

        document.getElementById("btn-edit-project-info")?.addEventListener("click", () => {
            const body = `
                <form id="form-edit-project" class="record-form">
                    <div class="field">
                        <label for="p-name">Project Name</label>
                        <input class="input" id="p-name" name="name" value="${proj.name}" required>
                    </div>
                    <div class="form-grid">
                        <div class="field">
                            <label for="p-num">Project Number</label>
                            <input class="input" id="p-num" name="number" value="${proj.number}" required>
                        </div>
                        <div class="field">
                            <label for="p-phase">Phase</label>
                            <input class="input" id="p-phase" name="phase" value="${proj.phase}">
                        </div>
                    </div>
                    <div class="field">
                        <label for="p-addr">Address</label>
                        <input class="input" id="p-addr" name="address" value="${proj.address}" required>
                    </div>
                    <div class="form-grid">
                        <div class="field">
                            <label for="p-val">Contract Value ($)</label>
                            <input class="input" id="p-val" name="value" type="number" value="${proj.value}">
                        </div>
                        <div class="field">
                            <label for="p-sf">Square Feet</label>
                            <input class="input" id="p-sf" name="squareFeet" type="number" value="${proj.squareFeet}">
                        </div>
                    </div>
                    <div class="form-grid">
                        <div class="field">
                            <label for="p-gc">General Contractor</label>
                            <input class="input" id="p-gc" name="generalContractor" value="${proj.generalContractor}">
                        </div>
                        <div class="field">
                            <label for="p-arch">Lead Architect</label>
                            <input class="input" id="p-arch" name="architect" value="${proj.architect}">
                        </div>
                    </div>
                    <div class="split">
                        <span></span>
                        <button class="button primary" type="submit"><i data-lucide="check"></i> Save Project Info</button>
                    </div>
                </form>
            `;

            document.dispatchEvent(new CustomEvent("open-modal", {
                detail: {
                    title: "Edit Project Information",
                    body,
                    onSubmit: (values) => {
                        values.value = Number(values.value || 0);
                        values.squareFeet = Number(values.squareFeet || 0);
                        recordStore.updateProjectInfo({ ...proj, ...values });
                        document.dispatchEvent(new CustomEvent("toast", { detail: "Project information updated" }));
                        location.hash = "#/project";
                    }
                }
            }));
        });
    }
}
