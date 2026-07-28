import { auth } from "../auth.js";
import { Card } from "../components/Card.js";

export class CreateProject {
    render({ params }) {
        const isSubJob = params.get("subjob") === "true";
        const parentJobId = params.get("parent");
        let parentJob = null;
        
        if (parentJobId) {
            parentJob = auth.getJob(parentJobId);
        }

        const suggestedNumber = isSubJob && parentJob 
            ? `${parentJob.number}.${String((auth.getSubJobs(parentJobId) || []).length + 1).padStart(2, "0")}`
            : this._generateJobNumber();

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">${isSubJob ? "Sub-Job" : "Administration"}</span>
                    <h1>${isSubJob ? "Create Sub-Job" : "Create New Project"}</h1>
                    <p>${isSubJob 
                        ? `Create a sub-job under <strong>${parentJob?.name || "Parent Project"}</strong> (${parentJob?.number})`
                        : "Set up a new construction project with all core parameters and contract data."}</p>
                </div>
            </section>

            <div class="auth-page" style="max-width: 900px; margin: 0 auto;">
                <div class="auth-card" style="max-width: none;">
                    <form id="form-create-project" class="record-form">
                        <input type="hidden" name="isSubJob" value="${isSubJob}">
                        ${parentJobId ? `<input type="hidden" name="parentJobId" value="${parentJobId}">` : ""}
                        
                        <div class="settings-section-label">Project Identification</div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="p-name">Project Name <span class="required">*</span></label>
                                <input class="input" id="p-name" name="name" required placeholder="e.g. Riverside Medical Center - Phase 2">
                            </div>
                            <div class="field">
                                <label for="p-number">Project Number <span class="required">*</span></label>
                                <div class="input-with-badge">
                                    <input class="input" id="p-number" name="number" required value="${suggestedNumber}" ${isSubJob ? "readonly" : ""}>
                                    <span class="badge neutral" id="number-format-hint">${isSubJob ? "Auto-generated from parent" : "Format: PRJ-XXXXXX"}</span>
                                </div>
                            </div>
                        </div>

                        <div class="field">
                            <label for="p-description">Description</label>
                            <textarea class="textarea" id="p-description" name="description" rows="2" placeholder="Brief project description or scope summary"></textarea>
                        </div>

                        <div class="field">
                            <label for="p-address">Site Address <span class="required">*</span></label>
                            <textarea class="textarea" id="p-address" name="address" required rows="2" placeholder="Full street address, city, state, ZIP"${isSubJob && parentJob ? ` value="${parentJob.address}"` : ""}></textarea>
                        </div>

                        <div class="settings-section-label" style="margin-top: 1.5rem;">Contract & Schedule</div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="p-phase">Current Phase</label>
                                <select class="select" id="p-phase" name="phase">
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
                                <label for="p-value">Contract Value ($) <span class="required">*</span></label>
                                <input class="input" id="p-value" name="value" type="number" min="0" step="1000" required placeholder="48250000">
                            </div>
                            <div class="field">
                                <label for="p-sf">Building Area (SF)</label>
                                <input class="input" id="p-sf" name="squareFeet" type="number" min="0" step="100" placeholder="215000">
                            </div>
                        </div>

                        <div class="form-grid">
                            <div class="field">
                                <label for="p-start">Start Date</label>
                                <input class="input" id="p-start" name="startDate" type="date" value="${new Date().toISOString().split("T")[0]}">
                            </div>
                            <div class="field">
                                <label for="p-completion">Target Completion</label>
                                <input class="input" id="p-completion" name="completionDate" type="date">
                            </div>
                        </div>

                        <div class="settings-section-label" style="margin-top: 1.5rem;">Key Contracting Entities</div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="p-gc">General Contractor <span class="required">*</span></label>
                                <input class="input" id="p-gc" name="generalContractor" required placeholder="e.g. Apex Construction Services"${isSubJob && parentJob ? ` value="${parentJob.generalContractor}"` : ""}>
                            </div>
                            <div class="field">
                                <label for="p-arch">Lead Architect <span class="required">*</span></label>
                                <input class="input" id="p-arch" name="architect" required placeholder="e.g. Design Studio International"${isSubJob && parentJob ? ` value="${parentJob.architect}"` : ""}>
                            </div>
                        </div>

                        <div class="field">
                            <label for="p-owner">Project Owner <span class="required">*</span></label>
                            <input class="input" id="p-owner" name="owner" required placeholder="e.g. Riverside Health Trust"${isSubJob && parentJob ? ` value="${parentJob.owner}"` : ""}>
                        </div>

                        <div class="settings-section-label" style="margin-top: 1.5rem;">Initial Setup</div>
                        <div class="field">
                            <label class="checkbox-wrapper">
                                <input type="checkbox" name="initializeBudget" id="p-init-budget" checked>
                                <span class="checkbox-check"><i data-lucide="check"></i></span>
                                <span>Initialize with standard CSI cost code budget template</span>
                            </label>
                        </div>
                        <div class="field">
                            <label class="checkbox-wrapper">
                                <input type="checkbox" name="initializeCostCodes" id="p-init-codes" checked>
                                <span class="checkbox-check"><i data-lucide="check"></i></span>
                                <span>Populate standard CSI MasterFormat cost codes</span>
                            </label>
                        </div>

                        <div class="split" style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--color-border);">
                            <a href="#/projects" class="button secondary"><i data-lucide="x"></i> Cancel</a>
                            <button class="button primary" type="submit"><i data-lucide="check"></i> ${isSubJob ? "Create Sub-Job" : "Create Project"}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    bind({ route, params }) {
        const form = document.getElementById("form-create-project");
        const isSubJob = params.get("subjob") === "true";

        form?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(form).entries());

            const currentUser = auth.getCurrentUser();
            if (!currentUser) {
                document.dispatchEvent(new CustomEvent("toast", { detail: "Please sign in to create a project" }));
                location.hash = "#/login";
                return;
            }

            const jobData = {
                name: data.name,
                number: data.number,
                description: data.description,
                address: data.address,
                phase: data.phase,
                value: Number(data.value || 0),
                squareFeet: Number(data.squareFeet || 0),
                startDate: data.startDate || new Date().toISOString().split("T")[0],
                completionDate: data.completionDate || "",
                owner: data.owner,
                architect: data.architect,
                generalContractor: data.generalContractor
            };

            let result;
            if (isSubJob && data.parentJobId) {
                result = auth.createSubJob(data.parentJobId, jobData);
            } else {
                result = auth.createJob(jobData);
            }

            if (result) {
                // Initialize budget if checked
                if (data.initializeBudget) {
                    this._initializeBudget(result.id);
                }
                if (data.initializeCostCodes) {
                    this._initializeCostCodes(result.id);
                }

                // Set as current project
                localStorage.setItem("cm.selectedProject", result.id);

                document.dispatchEvent(new CustomEvent("toast", { detail: `${isSubJob ? "Sub-job" : "Project"} "${result.name}" created successfully (${result.number})` }));
                location.hash = `#/project?id=${result.id}`;
            } else {
                document.dispatchEvent(new CustomEvent("toast", { detail: "Failed to create project" }));
            }
        });

        window.lucide?.createIcons();
    }

    _generateJobNumber() {
        const jobs = auth.getJobs();
        let maxNum = 0;
        for (const job of jobs) {
            const num = parseInt(job.number?.replace(/\D/g, "") || "0", 10);
            if (num > maxNum) maxNum = num;
        }
        return `PRJ-${String(maxNum + 1).padStart(6, "0")}`;
    }

    _initializeBudget(projectId) {
        const seedBudget = [
            { costCode: "01 31 00", description: "Project Management & Field Supervision", originalBudget: 2400000, approvedChanges: 0, revisedBudget: 2400000, commitments: 0, pendingExposure: 0, remainingBalance: 2400000 },
            { costCode: "01 50 00", description: "Temporary Facilities & Controls", originalBudget: 350000, approvedChanges: 0, revisedBudget: 350000, commitments: 0, pendingExposure: 0, remainingBalance: 350000 },
            { costCode: "02 41 00", description: "Demolition & Site Clearing", originalBudget: 480000, approvedChanges: 0, revisedBudget: 480000, commitments: 0, pendingExposure: 0, remainingBalance: 480000 },
            { costCode: "03 30 00", description: "Cast-in-Place Concrete & Reinforcing", originalBudget: 8600000, approvedChanges: 0, revisedBudget: 8600000, commitments: 0, pendingExposure: 0, remainingBalance: 8600000 },
            { costCode: "04 20 00", description: "Unit Masonry", originalBudget: 1200000, approvedChanges: 0, revisedBudget: 1200000, commitments: 0, pendingExposure: 0, remainingBalance: 1200000 },
            { costCode: "05 10 00", description: "Structural Steel Framing", originalBudget: 5400000, approvedChanges: 0, revisedBudget: 5400000, commitments: 0, pendingExposure: 0, remainingBalance: 5400000 },
            { costCode: "06 10 00", description: "Rough Carpentry", originalBudget: 950000, approvedChanges: 0, revisedBudget: 950000, commitments: 0, pendingExposure: 0, remainingBalance: 950000 },
            { costCode: "07 42 13", description: "Insulated Metal Panels & Envelope", originalBudget: 4200000, approvedChanges: 0, revisedBudget: 4200000, commitments: 0, pendingExposure: 0, remainingBalance: 4200000 },
            { costCode: "08 00 00", description: "Openings – Doors, Frames & Hardware", originalBudget: 1800000, approvedChanges: 0, revisedBudget: 1800000, commitments: 0, pendingExposure: 0, remainingBalance: 1800000 },
            { costCode: "09 00 00", description: "Finishes – Drywall, Flooring & Paint", originalBudget: 3600000, approvedChanges: 0, revisedBudget: 3600000, commitments: 0, pendingExposure: 0, remainingBalance: 3600000 },
            { costCode: "21 00 00", description: "Fire Suppression Systems", originalBudget: 1100000, approvedChanges: 0, revisedBudget: 1100000, commitments: 0, pendingExposure: 0, remainingBalance: 1100000 },
            { costCode: "22 00 00", description: "Plumbing Systems", originalBudget: 2800000, approvedChanges: 0, revisedBudget: 2800000, commitments: 0, pendingExposure: 0, remainingBalance: 2800000 },
            { costCode: "23 00 00", description: "HVAC & Mechanical Systems", originalBudget: 4500000, approvedChanges: 0, revisedBudget: 4500000, commitments: 0, pendingExposure: 0, remainingBalance: 4500000 },
            { costCode: "26 00 00", description: "Electrical Distribution & Lighting", originalBudget: 6800000, approvedChanges: 0, revisedBudget: 6800000, commitments: 0, pendingExposure: 0, remainingBalance: 6800000 },
            { costCode: "27 00 00", description: "Communications & Low Voltage", originalBudget: 900000, approvedChanges: 0, revisedBudget: 900000, commitments: 0, pendingExposure: 0, remainingBalance: 900000 },
            { costCode: "99 99 99", description: "Owner Contingency", originalBudget: 2400000, approvedChanges: 0, revisedBudget: 2400000, commitments: 0, pendingExposure: 0, remainingBalance: 2400000 }
        ];
        localStorage.setItem(`cmware_budget_${projectId}`, JSON.stringify(seedBudget));
    }

    _initializeCostCodes(projectId) {
        const seedCostCodes = [
            { code: "01 31 00", division: "01", description: "Project Management & Field Supervision", costType: "General Conditions", taxCategory: "Non-Taxable", budgetCategory: "Soft Costs", status: "Active" },
            { code: "01 50 00", division: "01", description: "Temporary Facilities & Controls", costType: "General Conditions", taxCategory: "Non-Taxable", budgetCategory: "Soft Costs", status: "Active" },
            { code: "02 41 00", division: "02", description: "Demolition & Site Clearing", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "Site Work", status: "Active" },
            { code: "03 30 00", division: "03", description: "Cast-in-Place Concrete & Reinforcing", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "Concrete", status: "Active" },
            { code: "04 20 00", division: "04", description: "Unit Masonry", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "Masonry", status: "Active" },
            { code: "05 10 00", division: "05", description: "Structural Steel Framing", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "Steel", status: "Active" },
            { code: "06 10 00", division: "06", description: "Rough Carpentry", costType: "Labor", taxCategory: "Taxable", budgetCategory: "Carpentry", status: "Active" },
            { code: "07 42 13", division: "07", description: "Insulated Metal Panels & Envelope", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "Envelope", status: "Active" },
            { code: "08 00 00", division: "08", description: "Openings – Doors, Frames & Hardware", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "Openings", status: "Active" },
            { code: "09 00 00", division: "09", description: "Finishes – Drywall, Flooring & Paint", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "Finishes", status: "Active" },
            { code: "21 00 00", division: "21", description: "Fire Suppression Systems", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "Fire Protection", status: "Active" },
            { code: "22 00 00", division: "22", description: "Plumbing Systems", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "Plumbing", status: "Active" },
            { code: "23 00 00", division: "23", description: "HVAC & Mechanical Systems", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "HVAC", status: "Active" },
            { code: "26 00 00", division: "26", description: "Electrical Distribution & Lighting", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "Electrical", status: "Active" },
            { code: "27 00 00", division: "27", description: "Communications & Low Voltage", costType: "Subcontract", taxCategory: "Taxable", budgetCategory: "Low Voltage", status: "Active" },
            { code: "99 99 99", division: "99", description: "Owner Contingency", costType: "Contingency", taxCategory: "Non-Taxable", budgetCategory: "Contingency", status: "Active" }
        ];
        localStorage.setItem(`cmware_cost_codes_${projectId}`, JSON.stringify(seedCostCodes));
    }
}