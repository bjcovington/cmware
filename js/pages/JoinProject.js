import { auth } from "../auth.js";
import { Card } from "../components/Card.js";

export class JoinProject {
    render() {
        const currentUser = auth.getCurrentUser();
        const jobs = auth.getJobs();
        const myJobs = jobs.filter(j => j.createdBy === currentUser?.id || auth.isUserOnJob(j.id, currentUser?.id));

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Projects</span>
                    <h1>Join a Project</h1>
                    <p>Enter a project number to join an existing project, or browse available projects</p>
                </div>
            </section>

            <div class="page-grid" style="grid-template-columns: 1fr;">
                <section class="card">
                    ${Card.render({
                        title: "Join by Project Number",
                        eyebrow: "Quick Access",
                        body: `
                            <form id="form-join-project" class="record-form" style="max-width: 500px;">
                                <div class="field">
                                    <label for="join-job-number">Project Number <span class="required">*</span></label>
                                    <div class="input-with-icon">
                                        <i data-lucide="hash" class="input-icon"></i>
                                        <input class="input" id="join-job-number" name="jobNumber" required placeholder="e.g. 123456 or PRJ-123456" autocomplete="off">
                                    </div>
                                    <p class="field-hint">Enter the 6-digit project number (e.g., 123456) or full project ID (e.g., PRJ-123456)</p>
                                </div>
                                <button class="button primary full-width" type="submit"><i data-lucide="log-in"></i> Join Project</button>
                            </form>
                        `
                    })}
                </section>

                <section class="card">
                    ${Card.render({
                        title: "Available Projects",
                        eyebrow: `Found ${jobs.length} project(s)`,
                        body: jobs.length ? `
                            <div class="projects-grid">
                                ${jobs.map(job => `
                                    <article class="project-card" data-job-id="${job.id}">
                                        <div class="project-card-header">
                                            <span class="badge ${job.isSubJob ? "warning" : "info"}">${job.isSubJob ? "Sub-Job" : "Main Job"}</span>
                                            <span class="project-number">${job.number}</span>
                                        </div>
                                        <h3 class="project-name">${job.name}</h3>
                                        <div class="project-meta">
                                            <span><i data-lucide="map-pin"></i> ${job.address || "No address"}</span>
                                            <span><i data-lucide="calendar"></i> ${job.phase}</span>
                                        </div>
                                        <div class="project-stats">
                                            <span class="stat"><strong>$${this._money(job.value)}</strong> Value</span>
                                            <span class="stat"><strong>${(job.squareFeet || 0).toLocaleString()}</strong> SF</span>
                                        </div>
                                        <div class="project-creator">
                                            <span class="muted">Created by: </span>
                                            <button class="button ghost small" data-action="join" data-job-id="${job.id}" type="button">Join</button>
                                        </div>
                                    </article>
                                `).join("")}
                            </div>
                        ` : `
                            <div class="empty-state">
                                <i data-lucide="building-2" class="empty-icon"></i>
                                <h3>No projects available</h3>
                                <p>Ask your project manager to create a project or share a project number with you.</p>
                                <a href="#/create-project" class="button primary"><i data-lucide="plus-circle"></i> Create New Project</a>
                            </div>
                        `
                    })}
                </section>

                ${myJobs.length ? `
                <section class="card">
                    ${Card.render({
                        title: "My Projects",
                        eyebrow: `${myJobs.length} project(s) you're part of`,
                        body: `
                            <div class="projects-grid">
                                ${myJobs.map(job => `
                                    <article class="project-card ${auth.isUserOnJob(job.id, currentUser.id) ? 'joined' : 'owned'}">
                                        <div class="project-card-header">
                                            <span class="badge ${job.isSubJob ? "warning" : "success"}">${job.createdBy === currentUser.id ? "Owner" : "Member"}</span>
                                            <span class="project-number">${job.number}</span>
                                        </div>
                                        <h3 class="project-name">${job.name}</h3>
                                        <div class="project-meta">
                                            <span><i data-lucide="map-pin"></i> ${job.address || "No address"}</span>
                                            <span><i data-lucide="calendar"></i> ${job.phase}</span>
                                        </div>
                                        <div class="project-stats">
                                            <span class="stat"><strong>$${this._money(job.value)}</strong> Value</span>
                                            <span class="stat"><strong>${(job.squareFeet || 0).toLocaleString()}</strong> SF</span>
                                        </div>
                                        <div class="project-actions">
                                            <a href="#/project?id=${job.id}" class="button primary" data-action="open" data-job-id="${job.id}"><i data-lucide="arrow-right"></i> Open Project</a>
                                        </div>
                                    </article>
                                `).join("")}
                            </div>
                        `
                    })}
                </section>
                ` : ""}
            </div>
        `;
    }

    bind() {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) return;

        document.getElementById("form-join-project")?.addEventListener("submit", (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target).entries());
            const jobNumber = data.jobNumber.trim().toUpperCase();

            // Normalize the number - if it's just digits, add PRJ- prefix
            const normalizedNumber = jobNumber.startsWith("PRJ-") ? jobNumber : `PRJ-${jobNumber.padStart(6, "0")}`;

            const result = auth.joinJobByNumber(normalizedNumber, currentUser.id);
            if (result.success) {
                document.dispatchEvent(new CustomEvent("toast", { detail: `Successfully joined ${result.job.name}` }));
                location.hash = `#/project?id=${result.job.id}`;
            } else {
                document.dispatchEvent(new CustomEvent("toast", { detail: result.message }));
            }
        });

        // Join from available projects list
        document.querySelectorAll("[data-action='join']").forEach(btn => {
            btn.addEventListener("click", () => {
                const jobId = btn.dataset.jobId;
                const job = auth.getJob(jobId);
                if (!job) return;

                const result = auth.joinJobByNumber(job.number, currentUser.id);
                if (result.success) {
                    document.dispatchEvent(new CustomEvent("toast", { detail: `Successfully joined ${job.name}` }));
                    location.hash = `#/project?id=${job.id}`;
                } else {
                    document.dispatchEvent(new CustomEvent("toast", { detail: result.message }));
                }
            });
        });

        window.lucide?.createIcons();
    }

    _money(val) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
            notation: val >= 1000000 ? "compact" : "standard"
        }).format(val || 0);
    }
}