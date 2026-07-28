document.addEventListener('DOMContentLoaded', () => {
    // ── Transition Screen ──
    const transitionScreen = document.getElementById('transition-screen');
    const topbar = document.querySelector('.topbar');
    const appLayout = document.querySelector('.app-layout');

    topbar.style.opacity = '0';
    appLayout.style.opacity = '0';

    // ── Auth Check ──
    const userRaw = localStorage.getItem('cmware_current_user');
    if (!userRaw) {
        window.location.href = '../index.html';
        return;
    }
    const user = JSON.parse(userRaw);

    // ── Load Job ──
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('jobId');
    if (!jobId) {
        window.location.href = 'dashboard.html';
        return;
    }

    const jobs = JSON.parse(localStorage.getItem('cmware_jobs') || '[]');
    const job = jobs.find(j => j.id === jobId);
    if (!job) {
        window.location.href = 'dashboard.html';
        return;
    }

    function reloadUsers() {
        return JSON.parse(localStorage.getItem('cmware_users') || '[]');
    }

    function getUserForEmail(email) {
        return reloadUsers().find(u => u.email === email);
    }

    // ── User Menu ──
    const initials = (user.firstName[0] + user.lastName[0]).toUpperCase();
    const userAvatar = document.getElementById('user-avatar');
    if (user.avatar) {
        userAvatar.innerHTML = `<img src="${user.avatar}" alt="${user.firstName}">`;
    } else {
        userAvatar.textContent = initials;
    }

    document.getElementById('user-name').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('dropdown-header').textContent = user.email;

    const userMenu = document.getElementById('user-menu');
    const dropdownMenu = document.getElementById('dropdown-menu');

    userMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('open');
    });

    document.addEventListener('click', () => {
        dropdownMenu.classList.remove('open');
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('cmware_current_user');
        window.location.href = '../index.html';
    });

    // ── Topbar ──
    function refreshTopbar() {
        const topInitials = (user.firstName[0] + user.lastName[0]).toUpperCase();
        const topAvatar = document.getElementById('user-avatar');
        if (user.avatar) {
            topAvatar.innerHTML = `<img src="${user.avatar}" alt="${user.firstName}">`;
        } else {
            topAvatar.textContent = topInitials;
        }
        document.getElementById('user-name').textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById('dropdown-header').textContent = user.email;
    }

    refreshTopbar();
    document.getElementById('topbar-job-number').textContent = job.jobNumber;
    document.getElementById('topbar-job-name').textContent = job.name;
    document.title = `CMWare - ${job.name}`;

    // ── Status Pill ──
    const statusPill = document.getElementById('job-status-pill');
    statusPill.textContent = job.status;
    statusPill.className = 'status-pill status-' + job.status.toLowerCase().replace(/\s+/g, '-');

    // ── Widget Definitions ──
    const WIDGET_DEFS = [
        { id: 'project-info', label: 'Project Info', default: true },
        { id: 'financials', label: 'Financial Summary', default: true },
        { id: 'change-orders', label: 'Change Orders', default: true },
        { id: 'rfis', label: 'RFIs', default: true },
        { id: 'submittals', label: 'Submittals', default: true },
        { id: 'punch-list', label: 'Punch List', default: true },
        { id: 'schedule', label: 'Schedule', default: true },
        { id: 'team', label: 'Team Members', default: true },
        { id: 'location', label: 'Location', default: true },
        { id: 'recent-activity', label: 'Recent Activity', default: false }
    ];

    function getWidgetPrefs() {
        const raw = localStorage.getItem(`cmware_dash_prefs_${jobId}`);
        if (raw) return JSON.parse(raw);
        const prefs = {};
        WIDGET_DEFS.forEach(w => { prefs[w.id] = w.default; });
        return prefs;
    }

    function saveWidgetPrefs(prefs) {
        localStorage.setItem(`cmware_dash_prefs_${jobId}`, JSON.stringify(prefs));
    }

    // ── Sidebar / Page Switching ──
    function switchPage(pageName) {
        document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.sidebar-link[data-page="${pageName}"]`);
        if (activeLink) activeLink.classList.add('active');

        document.querySelectorAll('.job-page').forEach(p => p.classList.remove('active'));
        const targetPage = document.getElementById('page-' + pageName);
        if (targetPage) targetPage.classList.add('active');

        document.getElementById('page-title').textContent = activeLink ? activeLink.querySelector('span').textContent : pageName;

        if (pageName === 'contacts') renderContacts();
    }

    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchPage(link.dataset.page);
        });
    });

    // ── Contacts Page ──
    const CONSTRUCTION_ROLES = [
        'Owner',
        'Lead Project Manager',
        'Project Manager',
        'Project Engineer',
        'Field Engineer',
        'Lead Superintendent',
        'Superintendent',
        'Owner\'s Rep',
        'Architect',
        'Interior Designer',
        'Civil Engineer',
        'Structural Engineer',
        'Mechanical Engineer',
        'Electrical Engineer',
        'Plumbing Engineer',
        'Intern',
        'Member'
    ];

    function reloadJob() {
        const updatedJobs = JSON.parse(localStorage.getItem('cmware_jobs') || '[]');
        const updated = updatedJobs.find(j => j.id === jobId);
        if (updated) Object.assign(job, updated);
    }

    function canManageMembers() {
        const member = job.members.find(m => m.email === user.email);
        return member && (member.role === 'Owner' || member.role === 'Lead Project Manager' || member.role === 'Project Manager');
    }

    function isOwner() {
        const member = job.members.find(m => m.email === user.email);
        return member && member.role === 'Owner';
    }

    function renderRoleOptions(selected) {
        return CONSTRUCTION_ROLES.map(r =>
            `<option value="${r}" ${r === selected ? 'selected' : ''}>${r}</option>`
        ).join('');
    }

    function renderRoleDropdownOptions(currentRole, idx) {
        return CONSTRUCTION_ROLES.map(r =>
            `<button data-role="${r}" data-set-role="${idx}" class="${r === currentRole ? 'current' : ''}">${r}</button>`
        ).join('');
    }

    function getMemberDisplayCompany(m) {
        if (m.company) return m.company;
        const u = getUserForEmail(m.email);
        return (u && u.company) ? u.company : '';
    }

    function getMemberDisplayPhone(m) {
        const u = getUserForEmail(m.email);
        return (u && u.phone) ? u.phone : '';
    }

    // ── Approval Modal ──
    let pendingApproveIdx = null;

    function openApproveModal(idx) {
        reloadJob();
        const requests = job.joinRequests || [];
        if (idx < 0 || idx >= requests.length) return;
        pendingApproveIdx = idx;
        const req = requests[idx];
        const reqUser = getUserForEmail(req.email);
        const initials = (req.firstName[0] + req.lastName[0]).toUpperCase();

        const avatarEl = document.getElementById('approve-avatar');
        if (reqUser && reqUser.avatar) {
            avatarEl.innerHTML = `<img src="${reqUser.avatar}" alt="">`;
        } else {
            avatarEl.innerHTML = initials;
        }

        document.getElementById('approve-name').textContent = req.firstName + ' ' + req.lastName;
        document.getElementById('approve-email').textContent = req.email;

        const roleSelect = document.getElementById('approve-role');
        roleSelect.innerHTML = renderRoleOptions('Member');

        document.getElementById('approve-company').value = (reqUser && reqUser.company) ? reqUser.company : '';
        document.getElementById('approve-notes').value = '';

        const overlay = document.getElementById('approve-overlay');
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeApproveModal() {
        pendingApproveIdx = null;
        document.getElementById('approve-overlay').classList.remove('open');
        document.body.style.overflow = '';
    }

    function showApproveSuccess(callback) {
        const body = document.getElementById('approve-body');
        body.innerHTML = `
            <div class="approve-success">
                <svg viewBox="0 0 60 60" width="56" height="56">
                    <circle cx="30" cy="30" r="28" fill="none" stroke="var(--google-green)" stroke-width="2.5"
                        stroke-dasharray="176" stroke-dashoffset="176"
                        style="animation: approveCircle 0.6s ease-out 0.1s forwards;"/>
                    <polyline points="18,31 26,39 42,22" fill="none" stroke="var(--google-green)" stroke-width="3"
                        stroke-linecap="round" stroke-linejoin="round"
                        stroke-dasharray="50" stroke-dashoffset="50"
                        style="animation: approveCheck 0.35s ease-out 0.55s forwards;"/>
                </svg>
                <h3>Approved</h3>
            </div>
        `;

        if (!document.getElementById('approve-keyframes')) {
            const style = document.createElement('style');
            style.id = 'approve-keyframes';
            style.textContent = `
                @keyframes approveCircle { to { stroke-dashoffset: 0; } }
                @keyframes approveCheck { to { stroke-dashoffset: 0; } }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            callback();
            closeApproveModal();
        }, 1200);
    }

    document.getElementById('approve-close').addEventListener('click', closeApproveModal);
    document.getElementById('approve-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'approve-overlay') closeApproveModal();
    });

    document.getElementById('approve-confirm-btn').addEventListener('click', () => {
        if (pendingApproveIdx === null) return;
        const role = document.getElementById('approve-role').value;
        const company = document.getElementById('approve-company').value.trim();
        const notes = document.getElementById('approve-notes').value.trim();
        approveRequest(pendingApproveIdx, role, company, notes);
    });

    document.getElementById('approve-deny-btn').addEventListener('click', () => {
        if (pendingApproveIdx === null) return;
        denyRequest(pendingApproveIdx);
        closeApproveModal();
    });

    function renderContacts() {
        reloadJob();
        const container = document.getElementById('contacts-content');
        const requests = job.joinRequests || [];
        const members = job.members || [];
        const canManage = canManageMembers();
        const owner = isOwner();

        let html = '';

        // Pending Requests
        if (requests.length > 0) {
            html += `
            <div class="contacts-section">
                <div class="contacts-section-header">
                    <span class="contacts-section-title">Pending Requests</span>
                    <span class="contacts-count">${requests.length}</span>
                </div>
                <div class="contact-list">`;

            requests.forEach((req, i) => {
                const reqUser = getUserForEmail(req.email);
                const initials = (req.firstName[0] + req.lastName[0]).toUpperCase();
                const avatarHtml = (reqUser && reqUser.avatar)
                    ? `<div class="contact-avatar"><img src="${reqUser.avatar}" alt=""></div>`
                    : `<div class="contact-avatar">${initials}</div>`;
                const timeAgo = getTimeAgo(req.requestedAt);
                const company = (reqUser && reqUser.company) ? reqUser.company : (req.company || '');

                html += `
                <div class="contact-card">
                    ${avatarHtml}
                    <div class="contact-info">
                        <div class="contact-name">${escapeHtml(req.firstName)} ${escapeHtml(req.lastName)}</div>
                        <div class="contact-meta-row">
                            <span class="contact-email">${escapeHtml(req.email)}</span>
                            ${company ? `<span class="contact-company">${escapeHtml(company)}</span>` : ''}
                        </div>
                        <div class="contact-meta-row">
                            <span class="request-time">Requested ${timeAgo}</span>
                        </div>
                    </div>
                    ${canManage ? `
                    <div class="contact-actions">
                        <button class="btn-approve-open" data-req-idx="${i}">Review</button>
                        <button class="btn-deny-inline" data-deny-idx="${i}">Deny</button>
                    </div>` : `<span class="contact-role-badge role-member">Awaiting</span>`}
                </div>`;
            });

            html += `</div></div>`;
        }

        // Members
        html += `
        <div class="contacts-section">
            <div class="contacts-section-header">
                <span class="contacts-section-title">Members</span>
                <span class="contacts-count">${members.length}</span>
            </div>
            <div class="contact-list">`;

        if (members.length === 0) {
            html += `<div class="no-contacts-msg">No members yet.</div>`;
        } else {
            members.forEach((m, i) => {
                const memberUser = getUserForEmail(m.email);
                const initials = (m.firstName[0] + m.lastName[0]).toUpperCase();
                const avatarHtml = (memberUser && memberUser.avatar)
                    ? `<div class="contact-avatar"><img src="${memberUser.avatar}" alt=""></div>`
                    : `<div class="contact-avatar">${initials}</div>`;

                const isCurrentUser = m.email === user.email;
                const canChangeRole = canManage && !isCurrentUser && m.role !== 'Owner';
                const displayCompany = getMemberDisplayCompany(m);
                const displayPhone = getMemberDisplayPhone(m);

                let roleBadgeHtml;
                if (canChangeRole) {
                    roleBadgeHtml = `
                    <div style="position:relative;">
                        <button class="btn-role-change" data-member-idx="${i}">
                            ${escapeHtml(m.role)}
                            <svg viewBox="0 0 24 24" width="10" height="10" style="margin-left:4px;" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                        </button>
                        <div class="role-dropdown" id="role-dropdown-${i}">
                            ${renderRoleDropdownOptions(m.role, i)}
                        </div>
                    </div>`;
                } else {
                    roleBadgeHtml = `<span class="contact-role-badge role-member">${escapeHtml(m.role)}${isCurrentUser ? ' (You)' : ''}</span>`;
                }

                let removeBtn = '';
                if ((owner || canChangeRole) && !isCurrentUser) {
                    removeBtn = `<button class="btn-remove-member" data-remove-idx="${i}" title="Remove from project">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>`;
                }

                html += `
                <div class="contact-card">
                    ${avatarHtml}
                    <div class="contact-info">
                        <div class="contact-name">${escapeHtml(m.firstName)} ${escapeHtml(m.lastName)}</div>
                        <div class="contact-meta-row">
                            ${displayPhone ? `<span class="contact-phone">${escapeHtml(displayPhone)}</span>` : ''}
                            <span class="contact-email">${escapeHtml(m.email)}</span>
                        </div>
                        <div class="contact-meta-row">
                            ${displayCompany ? `<span class="contact-company">${escapeHtml(displayCompany)}</span>` : ''}
                        </div>
                    </div>
                    ${roleBadgeHtml}
                    ${removeBtn}
                </div>`;
            });
        }

        html += `</div></div>`;

        container.innerHTML = html;

        // Approve open handlers
        container.querySelectorAll('.btn-approve-open').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.reqIdx);
                openApproveModal(idx);
            });
        });

        // Deny handlers
        container.querySelectorAll('[data-deny-idx]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.denyIdx);
                denyRequest(idx);
            });
        });

        // Role change dropdown toggles (for members)
        container.querySelectorAll('.btn-role-change').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = btn.dataset.memberIdx;
                const dropdown = document.getElementById('role-dropdown-' + idx);
                container.querySelectorAll('.role-dropdown').forEach(d => {
                    if (d !== dropdown) d.classList.remove('open');
                });
                dropdown.classList.toggle('open');
            });
        });

        // Role set handlers
        container.querySelectorAll('[data-set-role]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.setRole);
                const newRole = btn.dataset.role;
                setMemberRole(idx, newRole);
            });
        });

        // Remove member handlers
        container.querySelectorAll('.btn-remove-member').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.removeIdx);
                const m = job.members[idx];
                if (confirm(`Remove ${m.firstName} ${m.lastName} from this project?`)) {
                    removeMember(idx);
                }
            });
        });

        // Close role dropdowns on outside click
        const closeHandler = () => {
            container.querySelectorAll('.role-dropdown').forEach(d => d.classList.remove('open'));
        };
        document.removeEventListener('click', closeHandler);
        document.addEventListener('click', closeHandler);
    }

    function approveRequest(idx, role, company, notes) {
        reloadJob();
        const requests = job.joinRequests || [];
        if (idx < 0 || idx >= requests.length) return;

        const req = requests.splice(idx, 1)[0];
        job.members.push({
            email: req.email,
            firstName: req.firstName,
            lastName: req.lastName,
            role: role || 'Member',
            company: company || req.company || '',
            notes: notes || ''
        });

        saveJobsToStorage();
        showApproveSuccess(() => {
            renderContacts();
        });
    }

    function denyRequest(idx) {
        reloadJob();
        const requests = job.joinRequests || [];
        if (idx < 0 || idx >= requests.length) return;

        requests.splice(idx, 1);
        saveJobsToStorage();
        renderContacts();
    }

    function setMemberRole(idx, newRole) {
        reloadJob();
        if (idx < 0 || idx >= job.members.length) return;
        if (job.members[idx].email === user.email) return;
        if (job.members[idx].role === 'Owner') return;

        job.members[idx].role = newRole;
        saveJobsToStorage();
        renderContacts();
    }

    function removeMember(idx) {
        reloadJob();
        if (idx < 0 || idx >= job.members.length) return;
        if (job.members[idx].role === 'Owner') return;

        job.members.splice(idx, 1);
        saveJobsToStorage();
        renderContacts();
    }

    function saveJobsToStorage() {
        const allJobs = JSON.parse(localStorage.getItem('cmware_jobs') || '[]');
        const i = allJobs.findIndex(j => j.id === jobId);
        if (i !== -1) {
            allJobs[i] = job;
            localStorage.setItem('cmware_jobs', JSON.stringify(allJobs));
        }
    }

    function getTimeAgo(dateStr) {
        if (!dateStr) return '';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return mins + 'm ago';
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return hrs + 'h ago';
        const days = Math.floor(hrs / 24);
        return days + 'd ago';
    }

    // ── Render Dashboard Widgets ──
    function renderDashboard() {
        const prefs = getWidgetPrefs();
        const grid = document.getElementById('widget-grid');
        grid.innerHTML = '';

        const financials = job.financials || { originalCost: 0, changeOrders: 0, currentBudget: 0, spent: 0 };
        const openCOs = (job.changeOrders || []).filter(co => co.status === 'Open').length;
        const totalCOs = (job.changeOrders || []).length;
        const openRFIs = (job.rfis || []).filter(r => r.status === 'Open').length;
        const totalRFIs = (job.rfis || []).length;
        const openSubs = (job.submittals || []).filter(s => s.status === 'Open').length;
        const totalSubs = (job.submittals || []).length;
        const openPunch = (job.punchList || []).filter(p => p.status === 'Open').length;
        const totalPunch = (job.punchList || []).length;

        const locationParts = [job.address, job.city, job.state, job.zip].filter(Boolean).join(', ');

        if (prefs['project-info']) {
            const startDate = job.startDate ? new Date(job.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';
            const endDate = job.endDate ? new Date(job.endDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';

            grid.innerHTML += `
            <div class="widget widget-full">
                <div class="widget-header">
                    <span class="widget-title">Project Information</span>
                    <div class="widget-icon blue">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    </div>
                </div>
                <div class="info-grid">
                    <div class="info-item"><span class="info-label">Client</span><span class="info-value">${escapeHtml(job.client)}</span></div>
                    <div class="info-item"><span class="info-label">Job Type</span><span class="info-value">${escapeHtml(job.jobType || 'N/A')}</span></div>
                    <div class="info-item"><span class="info-label">Project Type</span><span class="info-value">${escapeHtml(job.projectType || 'N/A')}</span></div>
                    <div class="info-item"><span class="info-label">Status</span><span class="info-value">${escapeHtml(job.status)}</span></div>
                    <div class="info-item"><span class="info-label">Start Date</span><span class="info-value">${startDate}</span></div>
                    <div class="info-item"><span class="info-label">Est. End Date</span><span class="info-value">${endDate}</span></div>
                </div>
                ${job.description ? `<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border-color)"><span class="info-label">Description</span><p style="font-size:14px;color:var(--text-primary);margin-top:4px;">${escapeHtml(job.description)}</p></div>` : ''}
            </div>`;
        }

        if (prefs['financials']) {
            grid.innerHTML += `
            <div class="widget">
                <div class="widget-header">
                    <span class="widget-title">Financial Summary</span>
                    <div class="widget-icon green">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                    </div>
                </div>
                <div class="info-grid">
                    <div class="info-item"><span class="info-label">Original Budget</span><span class="info-value">${formatCurrency(financials.originalCost)}</span></div>
                    <div class="info-item"><span class="info-label">Change Orders</span><span class="info-value">${formatCurrency(financials.changeOrders)}</span></div>
                    <div class="info-item"><span class="info-label">Current Budget</span><span class="info-value">${formatCurrency(financials.currentBudget)}</span></div>
                    <div class="info-item"><span class="info-label">Spent to Date</span><span class="info-value">${formatCurrency(financials.spent)}</span></div>
                </div>
            </div>`;
        }

        if (prefs['change-orders']) {
            grid.innerHTML += `
            <div class="widget">
                <div class="widget-header">
                    <span class="widget-title">Change Orders</span>
                    <div class="widget-icon yellow">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                </div>
                <div class="widget-stat">
                    <div class="stat-value">${openCOs}</div>
                    <div class="stat-label">Open of ${totalCOs} Total</div>
                </div>
            </div>`;
        }

        if (prefs['rfis']) {
            grid.innerHTML += `
            <div class="widget">
                <div class="widget-header">
                    <span class="widget-title">RFIs</span>
                    <div class="widget-icon red">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                </div>
                <div class="widget-stat">
                    <div class="stat-value">${openRFIs}</div>
                    <div class="stat-label">Open of ${totalRFIs} Total</div>
                </div>
            </div>`;
        }

        if (prefs['submittals']) {
            grid.innerHTML += `
            <div class="widget">
                <div class="widget-header">
                    <span class="widget-title">Submittals</span>
                    <div class="widget-icon purple">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                    </div>
                </div>
                <div class="widget-stat">
                    <div class="stat-value">${openSubs}</div>
                    <div class="stat-label">Open of ${totalSubs} Total</div>
                </div>
            </div>`;
        }

        if (prefs['punch-list']) {
            grid.innerHTML += `
            <div class="widget">
                <div class="widget-header">
                    <span class="widget-title">Punch List</span>
                    <div class="widget-icon teal">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                </div>
                <div class="widget-stat">
                    <div class="stat-value">${openPunch}</div>
                    <div class="stat-label">Open of ${totalPunch} Total</div>
                </div>
            </div>`;
        }

        if (prefs['schedule']) {
            const startDate = job.startDate ? new Date(job.startDate + 'T00:00:00') : null;
            const endDate = job.endDate ? new Date(job.endDate + 'T00:00:00') : null;
            let progress = 0;
            if (startDate && endDate) {
                const total = endDate - startDate;
                const elapsed = Date.now() - startDate.getTime();
                progress = Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
            }

            grid.innerHTML += `
            <div class="widget widget-full">
                <div class="widget-header">
                    <span class="widget-title">Schedule</span>
                    <div class="widget-icon blue">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                </div>
                <div style="margin-bottom:10px;">
                    <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--text-secondary);margin-bottom:6px;">
                        <span>${job.startDate || 'TBD'} &mdash; ${job.endDate || 'TBD'}</span>
                        <span>${progress}%</span>
                    </div>
                    <div style="width:100%;height:8px;background:var(--bg-light);border-radius:4px;overflow:hidden;">
                        <div style="width:${progress}%;height:100%;background:${progress >= 100 ? 'var(--google-green)' : 'var(--google-blue)'};border-radius:4px;transition:width 0.3s;"></div>
                    </div>
                </div>
            </div>`;
        }

        if (prefs['team']) {
            const teamMembersHtml = job.members.map(m => {
                const memberUser = getUserForEmail(m.email);
                let avatarHtml;
                if (memberUser && memberUser.avatar) {
                    avatarHtml = `<div class="team-avatar"><img src="${memberUser.avatar}" alt=""></div>`;
                } else {
                    const mi = (m.firstName[0] + m.lastName[0]).toUpperCase();
                    avatarHtml = `<div class="team-avatar">${mi}</div>`;
                }
                return `
                <div class="team-member">
                    ${avatarHtml}
                    <div class="team-member-info">
                        <div class="team-member-name">${escapeHtml(m.firstName)} ${escapeHtml(m.lastName)}</div>
                        <div class="team-member-role">${escapeHtml(m.role)}</div>
                    </div>
                </div>`;
            }).join('');

            grid.innerHTML += `
            <div class="widget">
                <div class="widget-header">
                    <span class="widget-title">Team</span>
                    <div class="widget-icon blue">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                    </div>
                </div>
                <div class="team-list">${teamMembersHtml}</div>
            </div>`;
        }

        if (prefs['location'] && locationParts) {
            grid.innerHTML += `
            <div class="widget">
                <div class="widget-header">
                    <span class="widget-title">Location</span>
                    <div class="widget-icon red">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                </div>
                <div style="font-size:14px;color:var(--text-primary);line-height:1.5;">
                    ${job.address ? `<div>${escapeHtml(job.address)}</div>` : ''}
                    ${job.city || job.state || job.zip ? `<div>${escapeHtml(job.city || '')}${job.city && job.state ? ', ' : ''}${escapeHtml(job.state || '')} ${escapeHtml(job.zip || '')}</div>` : ''}
                </div>
            </div>`;
        }

        if (prefs['recent-activity']) {
            grid.innerHTML += `
            <div class="widget widget-full">
                <div class="widget-header">
                    <span class="widget-title">Recent Activity</span>
                    <div class="widget-icon green">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    </div>
                </div>
                <div style="font-size:13px;color:var(--text-secondary);padding:12px 0;text-align:center;">No recent activity yet.</div>
            </div>`;
        }
    }

    function formatCurrency(val) {
        if (!val) return '$0';
        return '$' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ── Customize Dashboard Modal ──
    const customizeOverlay = document.getElementById('customize-overlay');
    const togglesContainer = document.getElementById('widget-toggles');
    let tempPrefs = {};

    document.getElementById('btn-customize-dashboard').addEventListener('click', () => {
        tempPrefs = getWidgetPrefs();
        togglesContainer.innerHTML = '';
        WIDGET_DEFS.forEach(w => {
            const row = document.createElement('div');
            row.className = 'widget-toggle';
            row.innerHTML = `
                <span class="widget-toggle-label">${w.label}</span>
                <label class="widget-toggle-switch">
                    <input type="checkbox" data-widget="${w.id}" ${tempPrefs[w.id] ? 'checked' : ''}>
                    <span class="widget-toggle-slider"></span>
                </label>
            `;
            row.querySelector('input').addEventListener('change', (e) => {
                tempPrefs[w.id] = e.target.checked;
            });
            togglesContainer.appendChild(row);
        });
        customizeOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    });

    document.getElementById('customize-close').addEventListener('click', () => {
        customizeOverlay.classList.remove('open');
        document.body.style.overflow = '';
    });

    document.getElementById('customize-cancel').addEventListener('click', () => {
        customizeOverlay.classList.remove('open');
        document.body.style.overflow = '';
    });

    customizeOverlay.addEventListener('click', (e) => {
        if (e.target === customizeOverlay) {
            customizeOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    });

    document.getElementById('customize-save').addEventListener('click', () => {
        saveWidgetPrefs(tempPrefs);
        renderDashboard();
        customizeOverlay.classList.remove('open');
        document.body.style.overflow = '';
    });

    // ── Settings Modal (reused pattern) ──
    const settingsOverlay = document.getElementById('settings-modal-overlay');
    const settingsProfileForm = document.getElementById('settings-profile-form');
    const settingsPasswordForm = document.getElementById('settings-password-form');
    const settingsAvatarPreview = document.getElementById('settings-avatar-preview');
    let settingsNewAvatar = user.avatar || null;

    function openSettingsModal() {
        settingsNewAvatar = user.avatar || null;
        renderSettingsAvatar();
        document.getElementById('settings-firstname').value = user.firstName;
        document.getElementById('settings-lastname').value = user.lastName;
        document.getElementById('settings-email').value = user.email;
        document.getElementById('settings-phone').value = user.phone || '';
        document.getElementById('settings-company').value = user.company || '';
        document.getElementById('settings-current-pw').value = '';
        document.getElementById('settings-new-pw').value = '';
        document.getElementById('settings-confirm-pw').value = '';
        document.getElementById('settings-profile-msg').textContent = '';
        document.getElementById('settings-profile-msg').className = 'settings-msg';
        document.getElementById('settings-password-msg').textContent = '';
        document.getElementById('settings-password-msg').className = 'settings-msg';
        document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('.settings-tab[data-settings-tab="profile"]').classList.add('active');
        document.querySelectorAll('.settings-tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById('settings-tab-profile').classList.add('active');
        dropdownMenu.classList.remove('open');
        settingsOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeSettingsModal() {
        settingsOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    function renderSettingsAvatar() {
        if (settingsNewAvatar) {
            settingsAvatarPreview.innerHTML = `<img src="${settingsNewAvatar}" alt="Avatar">`;
        } else {
            settingsAvatarPreview.innerHTML = `<svg class="default-avatar" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="50" fill="#e0e0e0"/>
                <circle cx="50" cy="38" r="16" fill="#bdbdbd"/>
                <ellipse cx="50" cy="75" rx="26" ry="20" fill="#bdbdbd"/>
            </svg>`;
        }
    }

    function updateCurrentUser(updatedFields) {
        Object.assign(user, updatedFields);
        localStorage.setItem('cmware_current_user', JSON.stringify(user));
        const users = JSON.parse(localStorage.getItem('cmware_users') || '[]');
        const idx = users.findIndex(u => u.id === user.id);
        if (idx !== -1) {
            users[idx] = { ...users[idx], ...updatedFields };
        } else {
            users.push({ ...user });
        }
        localStorage.setItem('cmware_users', JSON.stringify(users));
        refreshTopbar();
    }

    document.getElementById('settings-btn').addEventListener('click', openSettingsModal);
    document.getElementById('settings-modal-close').addEventListener('click', closeSettingsModal);
    settingsOverlay.addEventListener('click', (e) => {
        if (e.target === settingsOverlay) closeSettingsModal();
    });

    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.settings-tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById('settings-tab-' + tab.dataset.settingsTab).classList.add('active');
        });
    });

    document.getElementById('settings-avatar-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                settingsNewAvatar = event.target.result;
                renderSettingsAvatar();
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('settings-remove-avatar').addEventListener('click', () => {
        settingsNewAvatar = null;
        renderSettingsAvatar();
    });

    const settingsPhoneInput = document.getElementById('settings-phone');
    settingsPhoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) value = value.slice(0, 10);
        if (value.length >= 7) {
            value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
        } else if (value.length >= 4) {
            value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
        } else if (value.length >= 1) {
            value = `(${value}`;
        }
        e.target.value = value;
    });

    settingsProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const msgEl = document.getElementById('settings-profile-msg');
        const firstName = document.getElementById('settings-firstname').value.trim();
        const lastName = document.getElementById('settings-lastname').value.trim();
        const email = document.getElementById('settings-email').value.trim();
        const phone = document.getElementById('settings-phone').value.trim();
        const company = document.getElementById('settings-company').value.trim();

        if (!firstName || !lastName || !email) {
            msgEl.textContent = 'Please fill in all required fields.';
            msgEl.className = 'settings-msg error';
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            msgEl.textContent = 'Please enter a valid email address.';
            msgEl.className = 'settings-msg error';
            return;
        }

        if (email !== user.email) {
            const users = JSON.parse(localStorage.getItem('cmware_users') || '[]');
            if (users.some(u => u.email === email && u.id !== user.id)) {
                msgEl.textContent = 'An account with this email already exists.';
                msgEl.className = 'settings-msg error';
                return;
            }
            const currentJobs = JSON.parse(localStorage.getItem('cmware_jobs') || '[]');
            currentJobs.forEach(j => {
                if (j.createdBy === user.email) j.createdBy = email;
                j.members.forEach(m => { if (m.email === user.email) m.email = email; });
            });
            localStorage.setItem('cmware_jobs', JSON.stringify(currentJobs));
        }

        updateCurrentUser({ firstName, lastName, email, phone, company, avatar: settingsNewAvatar });
        msgEl.textContent = 'Profile saved successfully!';
        msgEl.className = 'settings-msg success';
    });

    settingsPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const msgEl = document.getElementById('settings-password-msg');
        const currentPw = document.getElementById('settings-current-pw').value;
        const newPw = document.getElementById('settings-new-pw').value;
        const confirmPw = document.getElementById('settings-confirm-pw').value;

        const users = JSON.parse(localStorage.getItem('cmware_users') || '[]');
        const storedUser = users.find(u => u.id === user.id);

        if (!storedUser || storedUser.password !== currentPw) {
            msgEl.textContent = 'Current password is incorrect.';
            msgEl.className = 'settings-msg error';
            return;
        }
        if (newPw.length < 6) {
            msgEl.textContent = 'New password must be at least 6 characters.';
            msgEl.className = 'settings-msg error';
            return;
        }
        if (newPw !== confirmPw) {
            msgEl.textContent = 'New passwords do not match.';
            msgEl.className = 'settings-msg error';
            return;
        }

        storedUser.password = newPw;
        localStorage.setItem('cmware_users', JSON.stringify(users));
        document.getElementById('settings-current-pw').value = '';
        document.getElementById('settings-new-pw').value = '';
        document.getElementById('settings-confirm-pw').value = '';
        msgEl.textContent = 'Password updated successfully!';
        msgEl.className = 'settings-msg success';
    });

    // ── Init ──
    renderDashboard();

    // Play transition animation then reveal content
    setTimeout(() => {
        transitionScreen.classList.add('fade-out');
        topbar.style.transition = 'opacity 0.4s ease';
        appLayout.style.transition = 'opacity 0.4s ease';
        topbar.style.opacity = '1';
        appLayout.style.opacity = '1';
        setTimeout(() => {
            transitionScreen.remove();
        }, 500);
    }, 1500);
});
