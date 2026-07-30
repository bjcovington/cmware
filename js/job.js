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

        if (pageName === 'dashboard') renderDashboard();
        else if (pageName === 'contacts') renderContacts();
        else if (pageName === 'cost') renderCostPage();
        else if (pageName === 'change-orders') renderCOPage();
        else if (pageName === 'rfis') renderRFIsPage();
        else if (pageName === 'submittals') renderSubmittalsPage();
        else if (pageName === 'punch-list') renderPunchListPage();
        else if (pageName === 'schedule') renderSchedulePage();
        else if (pageName === 'daily-logs') renderDailyLogsPage();
        else if (pageName === 'drawings') renderPlaceholder('drawings-content', '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>', 'Drawings', 'Upload and manage project drawings. This feature is coming soon.');
        else if (pageName === 'documents') renderPlaceholder('documents-content', '<path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/>', 'Documents', 'Store and organize project documents. This feature is coming soon.');
        else if (pageName === 'photos') renderPlaceholder('photos-content', '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>', 'Photos', 'Upload and view project photos. This feature is coming soon.');
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
        const isProjectOwner = job.createdBy === user.email;

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
                        <span class="contact-detail">${escapeHtml(req.email)}</span>
                        ${company ? `<span class="contact-detail">${escapeHtml(company)}</span>` : ''}
                        <span class="request-time" style="margin-top:2px;">Requested ${timeAgo}</span>
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
                const displayCompany = getMemberDisplayCompany(m);
                const displayPhone = getMemberDisplayPhone(m);
                const canChangeRole = canManage && !isCurrentUser && m.role !== 'Owner';
                const isOwnerMember = m.role === 'Owner';

                // Build the three-dots dropdown options
                let dropdownItems = '';
                if (isCurrentUser) {
                    dropdownItems = `<button data-edit-self>Edit My Details</button>`;
                } else if (canChangeRole) {
                    dropdownItems = `
                        <button data-change-role="${i}">Change Role</button>
                        <button class="danger" data-remove-idx="${i}">Remove</button>`;
                }

                let dropdownHtml = '';
                if (dropdownItems) {
                    dropdownHtml = `
                    <div class="contact-card-right">
                        <button class="three-dots-btn" data-dots="${i}">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <circle cx="12" cy="5" r="1.5"/>
                                <circle cx="12" cy="12" r="1.5"/>
                                <circle cx="12" cy="19" r="1.5"/>
                            </svg>
                        </button>
                        <div class="three-dots-dropdown" data-dropdown="${i}">
                            <div class="dropdown-main">
                                ${dropdownItems}
                            </div>
                            <div class="role-submenu" data-rolesub="${i}">
                                <div class="submenu-header" data-back-roles="${i}">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                                    Change Role
                                </div>
                                ${CONSTRUCTION_ROLES.map(r => `<button data-set-role="${i}" data-role="${r}" class="${r === m.role ? 'current' : ''}">${r}</button>`).join('')}
                            </div>
                        </div>
                    </div>`;
                }

                const roleClickable = canChangeRole ? 'clickable' : '';

                html += `
                <div class="contact-card">
                    ${avatarHtml}
                    <div class="contact-info">
                        <div class="contact-name">${escapeHtml(m.firstName)} ${escapeHtml(m.lastName)}</div>
                        <span class="contact-detail">${escapeHtml(m.email)}</span>
                        ${displayPhone ? `<span class="contact-detail">${escapeHtml(displayPhone)}</span>` : ''}
                        ${displayCompany ? `<span class="contact-detail">${escapeHtml(displayCompany)}</span>` : ''}
                        <span class="contact-role-badge ${roleClickable}">${escapeHtml(m.role)}${isCurrentUser ? ' (You)' : ''}</span>
                    </div>
                    ${dropdownHtml}
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

        // Three-dots toggle
        container.querySelectorAll('.three-dots-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = btn.dataset.dots;
                const dropdown = document.querySelector(`[data-dropdown="${idx}"]`);
                container.querySelectorAll('.three-dots-dropdown').forEach(d => {
                    if (d !== dropdown) {
                        d.classList.remove('open');
                        d.querySelector('.role-submenu')?.classList.remove('open');
                    }
                });
                dropdown.classList.toggle('open');
            });
        });

        // Edit My Details
        container.querySelectorAll('[data-edit-self]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.three-dots-dropdown').forEach(d => d.classList.remove('open'));
                openSettingsModal();
            });
        });

        // Change Role (shows submenu)
        container.querySelectorAll('[data-change-role]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = btn.dataset.changeRole;
                const dropdown = document.querySelector(`[data-dropdown="${idx}"]`);
                dropdown.querySelector('.dropdown-main').style.display = 'none';
                dropdown.querySelector('.role-submenu').classList.add('open');
            });
        });

        // Back from role submenu
        container.querySelectorAll('[data-back-roles]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = btn.dataset.backRoles;
                const dropdown = document.querySelector(`[data-dropdown="${idx}"]`);
                dropdown.querySelector('.role-submenu').classList.remove('open');
                dropdown.querySelector('.dropdown-main').style.display = '';
            });
        });

        // Set role from submenu
        container.querySelectorAll('[data-set-role]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.setRole);
                const newRole = btn.dataset.role;
                setMemberRole(idx, newRole);
            });
        });

        // Remove member handlers
        container.querySelectorAll('[data-remove-idx]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.removeIdx);
                const m = job.members[idx];
                if (confirm(`Remove ${m.firstName} ${m.lastName} from this project?`)) {
                    removeMember(idx);
                }
            });
        });

        // Close dropdowns on outside click
        const closeHandler = () => {
            container.querySelectorAll('.three-dots-dropdown').forEach(d => {
                d.classList.remove('open');
                d.querySelector('.role-submenu')?.classList.remove('open');
                d.querySelector('.dropdown-main').style.display = '';
            });
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

    // ── Data helpers ──
    function ensureArray(arr) {
        return Array.isArray(arr) ? arr : [];
    }

    function nextId(items) {
        const existing = ensureArray(items);
        return existing.length > 0 ? Math.max(...existing.map(i => i.id || 0)) + 1 : 1;
    }

    function openModal(id) {
        document.getElementById(id).classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(id) {
        document.getElementById(id).classList.remove('open');
        document.body.style.overflow = '';
    }

    // ── Cost Management: Sub-tabs ──
    document.querySelectorAll('[data-cost-tab]').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('[data-cost-tab]').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderCostPage();
        });
    });

    // ── CSI Divisions ──
    const CSI_DIVISIONS = [
        '01 00 00 - General Requirements',
        '02 00 00 - Existing Conditions',
        '03 00 00 - Concrete',
        '04 00 00 - Masonry',
        '05 00 00 - Metals',
        '06 00 00 - Wood, Plastics, and Composites',
        '07 00 00 - Thermal and Moisture Protection',
        '08 00 00 - Openings',
        '09 00 00 - Finishes',
        '10 00 00 - Specialties',
        '11 00 00 - Equipment',
        '12 00 00 - Furnishings',
        '13 00 00 - Special Construction',
        '14 00 00 - Conveying Equipment',
        '21 00 00 - Fire Suppression',
        '22 00 00 - Plumbing',
        '23 00 00 - Heating, Ventilating, and Air Conditioning',
        '26 00 00 - Electrical',
        '27 00 00 - Communications',
        '28 00 00 - Electronic Safety and Security',
        '31 00 00 - Earthwork',
        '32 00 00 - Exterior Improvements',
        '33 00 00 - Utilities',
        '34 00 00 - Transportation',
        '35 00 00 - Waterway and Marine',
        '40 00 00 - Process Integration',
        '41 00 00 - Material Processing and Handling',
        '42 00 00 - Process Heating, Cooling, and Drying',
        '43 00 00 - Process Gas and Liquid Handling, Purification, and Storage',
        '44 00 00 - Pollution and Waste Control',
        '45 00 00 - Industry-Specific Manufacturing',
        '48 00 00 - Electrical Power Generation'
    ];

    function populateDivisionSelect(selectId, selected) {
        const sel = document.getElementById(selectId);
        sel.innerHTML = '<option value="">-- Select Division --</option>';
        CSI_DIVISIONS.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d;
            if (d === selected) opt.selected = true;
            sel.appendChild(opt);
        });
    }

    // ── Cost Management Page ──
    // ── Default Buckets ──
    const DEFAULT_BUCKETS = ['Labor', 'Materials', 'Equipment', 'Subcontract', 'General Conditions', 'Other'];

    function ensureBuckets(cc) {
        if (!cc.buckets || cc.buckets.length === 0) {
            cc.buckets = DEFAULT_BUCKETS.map((name, i) => ({
                id: i + 1,
                name,
                budget: 0,
                actual: 0
            }));
        }
    }

    function ensureAllBuckets() {
        const codes = ensureArray(job.costCodes);
        codes.forEach(cc => ensureBuckets(cc));
    }

    // ── Commitments → Committed auto-calc ──
    function calcCommittedMap() {
        const cmts = ensureArray(job.commitments);
        const map = {};
        cmts.forEach(c => {
            const key = c.costCodeId + '-' + c.bucketId;
            map[key] = (map[key] || 0) + Number(c.amount || 0);
        });
        return map;
    }

    function getCommitted(ccId, bId, committedMap) {
        return committedMap[ccId + '-' + bId] || 0;
    }

    function getCommitmentCount(ccId, bId) {
        const cmts = ensureArray(job.commitments);
        return cmts.filter(c => c.costCodeId === ccId && c.bucketId === bId).length;
    }

    function renderCostPage() {
        reloadJob();
        const activeTab = document.querySelector('[data-cost-tab].active');
        const tab = activeTab ? activeTab.dataset.costTab : 'overview';
        const container = document.getElementById('cost-content');

        if (tab === 'costcodes') {
            renderCostCodes(container);
            return;
        }

        if (tab === 'commitments') {
            renderCommitments(container);
            return;
        }

        // ── Overview tab ──
        const codes = ensureArray(job.costCodes);
        const hasBuckets = codes.some(cc => ensureArray(cc.buckets).length > 0);
        const cMap = calcCommittedMap();

        let totalBudget = 0, totalActual = 0, totalCommitted = 0;

        if (hasBuckets) {
            codes.forEach(cc => {
                ensureArray(cc.buckets).forEach(b => {
                    totalBudget += Number(b.budget || 0);
                    totalActual += Number(b.actual || 0);
                    totalCommitted += getCommitted(cc.id, b.id, cMap);
                });
            });
        } else {
            // Fallback to cost items for backward compat
            const items = ensureArray(job.costItems);
            totalBudget = items.filter(i => i.type === 'Budget').reduce((s, i) => s + Number(i.amount || 0), 0);
            totalActual = items.filter(i => i.type === 'Actual').reduce((s, i) => s + Number(i.amount || 0), 0);
            totalCommitted = items.filter(i => i.type === 'Committed').reduce((s, i) => s + Number(i.amount || 0), 0);
        }

        const remaining = totalBudget - totalCommitted;

        let html = `
        <div class="cost-summary-cards">
            <div class="cost-summary-card">
                <div class="label">Budget</div>
                <div class="value">${formatCurrency(totalBudget)}</div>
            </div>
            <div class="cost-summary-card">
                <div class="label">Actual</div>
                <div class="value">${formatCurrency(totalActual)}</div>
            </div>
            <div class="cost-summary-card">
                <div class="label">Committed</div>
                <div class="value">${formatCurrency(totalCommitted)}</div>
            </div>
            <div class="cost-summary-card">
                <div class="label">Remaining</div>
                <div class="value ${remaining >= 0 ? 'positive' : 'negative'}">${formatCurrency(remaining)}</div>
            </div>
        </div>`;

        // Cost codes summary table
        if (codes.length > 0) {
            html += `<div class="cost-codes-summary"><h3>Cost Code Summary</h3><table class="data-table"><thead><tr>
                <th>Code #</th><th>Name</th><th style="text-align:right;">Budget</th><th style="text-align:right;">Actual</th><th style="text-align:right;">Committed</th><th style="text-align:right;">Remaining</th>
            </tr></thead><tbody>`;
            codes.forEach(cc => {
                let ccBudget = 0, ccActual = 0, ccCommitted = 0;
                ensureArray(cc.buckets).forEach(b => {
                    ccBudget += Number(b.budget || 0);
                    ccActual += Number(b.actual || 0);
                    ccCommitted += getCommitted(cc.id, b.id, cMap);
                });
                const ccRem = ccBudget - ccCommitted;
                const remCls = ccRem >= 0 ? 'positive' : 'negative';
                html += `<tr>
                    <td><strong>${escapeHtml(cc.number || '')}</strong></td>
                    <td>${escapeHtml(cc.name || '')}</td>
                    <td style="text-align:right;">${formatCurrency(ccBudget)}</td>
                    <td style="text-align:right;">${formatCurrency(ccActual)}</td>
                    <td style="text-align:right;">${formatCurrency(ccCommitted)}</td>
                    <td style="text-align:right;" class="bucket-amount ${remCls}">${formatCurrency(ccRem)}</td>
                </tr>`;
            });
            html += `</tbody></table></div>`;
        }

        // Cost items table (legacy)
        const items = ensureArray(job.costItems);
        if (items.length > 0) {
            html += `<h3 style="font-size:14px;font-weight:600;margin-top:20px;margin-bottom:8px;">Cost Items</h3><table class="data-table"><thead><tr><th>Category</th><th>Description</th><th>Type</th><th style="text-align:right;">Amount</th><th></th></tr></thead><tbody>`;
            items.forEach((it, i) => {
                html += `<tr>
                    <td>${escapeHtml(it.category)}</td>
                    <td>${escapeHtml(it.description)}</td>
                    <td><span class="status-badge ${it.type === 'Budget' ? 'approved' : it.type === 'Actual' ? 'open' : 'pending'}">${escapeHtml(it.type)}</span></td>
                    <td style="text-align:right;font-weight:600;">${formatCurrency(it.amount)}</td>
                    <td style="text-align:right;"><button class="btn-icon" data-del-cost="${i}" title="Delete"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></td>
                </tr>`;
            });
            html += `</tbody></table>`;
        } else if (!hasBuckets) {
            html += `<div class="page-placeholder"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg><h3>No cost data yet</h3><p>Add cost codes with buckets, or create legacy cost items to track project finances.</p></div>`;
        }

        container.innerHTML = html;

        container.querySelectorAll('[data-del-cost]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.delCost);
                if (confirm('Delete this cost item?')) {
                    job.costItems.splice(idx, 1);
                    saveJobsToStorage();
                    renderCostPage();
                }
            });
        });
    }

    // ── Cost Codes ──
    let editingCostCode = null;
    let editingBucketCCIdx = null;
    let editingBucketIdx = null;

    function renderCostCodes(container) {
        ensureAllBuckets();
        const codes = ensureArray(job.costCodes);
        const search = (document.getElementById('costcode-search') || {}).value || '';
        const cMap = calcCommittedMap();

        let html = `
        <div class="search-bar-wrap">
            <input type="text" id="costcode-search" placeholder="Search cost codes..." value="${escapeHtml(search)}">
            <button class="btn-primary btn-sm" id="btn-add-costcode">Add Cost Code</button>
            ${codes.length > 0 ? `<span class="costcode-count">${codes.length}</span>` : ''}
        </div>`;

        const filtered = search
            ? codes.filter(c =>
                (c.number || '').toLowerCase().includes(search.toLowerCase()) ||
                (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
                (c.division || '').toLowerCase().includes(search.toLowerCase()) ||
                (c.description || '').toLowerCase().includes(search.toLowerCase())
              )
            : codes;

        if (filtered.length === 0) {
            if (codes.length === 0) {
                html += `<div class="page-placeholder"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg><h3>No cost codes yet</h3><p>Create cost codes to categorize and track project costs by CSI division.</p></div>`;
            } else {
                html += `<div class="page-placeholder"><p style="color:var(--text-secondary);font-size:14px;">No cost codes match your search.</p></div>`;
            }
            container.innerHTML = html;
            bindCostCodeSearch(container);
            return;
        }

        html += `<table class="data-table" id="costcode-tree"><thead><tr>
            <th style="width:28px;"></th>
            <th>CSI Division</th>
            <th>Code #</th>
            <th>Name</th>
            <th style="text-align:right;">Budget</th>
            <th style="text-align:right;">Actual</th>
            <th style="text-align:right;">Committed</th>
            <th style="text-align:right;">Remaining</th>
            <th>Status</th>
            <th></th>
        </tr></thead><tbody>`;

        filtered.forEach((cc, i) => {
            const realIdx = codes.indexOf(cc);
            const statusClass = cc.status === 'Active' ? 'approved' : 'closed';
            const divisionShort = cc.division ? cc.division.replace(/ \d{2} 00 00 - /, ' ').substring(0, 34) : '';
            const buckets = ensureArray(cc.buckets);
            let ccBudget = 0, ccActual = 0, ccCommitted = 0;
            buckets.forEach(b => {
                ccBudget += Number(b.budget || 0);
                ccActual += Number(b.actual || 0);
                ccCommitted += getCommitted(cc.id, b.id, cMap);
            });
            const ccRem = ccBudget - ccCommitted;
            const ccRemCls = ccRem >= 0 ? 'positive' : 'negative';

            html += `<tr data-cc-header="${realIdx}">
                <td>
                    ${buckets.length > 0 ? `<button class="tree-toggle" data-toggle-cc="${realIdx}" title="Expand">▶</button>` : ''}
                </td>
                <td style="font-size:12px;">${escapeHtml(divisionShort || cc.division || '—')}</td>
                <td><strong>${escapeHtml(cc.number || '')}</strong></td>
                <td>${escapeHtml(cc.name || '')}</td>
                <td style="text-align:right;font-size:13px;">${formatCurrency(ccBudget)}</td>
                <td style="text-align:right;font-size:13px;">${formatCurrency(ccActual)}</td>
                <td style="text-align:right;font-size:13px;">${formatCurrency(ccCommitted)}</td>
                <td style="text-align:right;font-size:13px;" class="bucket-amount ${ccRemCls}">${formatCurrency(ccRem)}</td>
                <td><span class="status-badge ${statusClass}">${escapeHtml(cc.status || 'Active')}</span></td>
                <td style="text-align:right;">
                    <button class="btn-icon" data-edit-costcode="${realIdx}" title="Edit"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                    <button class="btn-icon" data-del-costcode="${realIdx}" title="Delete"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                </td>
            </tr>`;

            // Bucket sub-rows
            buckets.forEach((b, bi) => {
                const committed = getCommitted(cc.id, b.id, cMap);
                const remaining = Number(b.budget || 0) - committed;
                const bRemClass = remaining >= 0 ? 'positive' : 'negative';
                const cmtCount = getCommitmentCount(cc.id, b.id);
                html += `<tr class="bucket-row" data-cc-parent="${realIdx}">
                    <td></td>
                    <td colspan="2"><span class="bucket-label">${escapeHtml(b.name)}</span></td>
                    <td></td>
                    <td style="text-align:right;"><input class="bucket-editable" type="number" step="0.01" value="${b.budget || 0}" data-save-budget="${realIdx}" data-bucket-idx="${bi}"></td>
                    <td style="text-align:right;"><input class="bucket-editable" type="number" step="0.01" value="${b.actual || 0}" data-save-actual="${realIdx}" data-bucket-idx="${bi}"></td>
                    <td style="text-align:right;"><span class="bucket-static ${bRemClass}">${formatCurrency(committed)}${cmtCount > 0 ? `<span title="${cmtCount} commitment(s)">*</span>` : ''}</span></td>
                    <td style="text-align:right;" class="bucket-amount ${bRemClass}">${formatCurrency(remaining)}</td>
                    <td colspan="2">
                        <div class="bucket-actions-inline" style="justify-content:flex-end;">
                            <button class="btn-icon" data-edit-bucket="${realIdx}" data-bucket-idx="${bi}" title="Edit"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                            <button class="btn-icon" data-del-bucket="${realIdx}" data-bucket-idx="${bi}" title="Delete"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                        </div>
                    </td>
                </tr>`;
            });

            // Add bucket row
            html += `<tr class="bucket-row" data-cc-parent="${realIdx}">
                <td></td>
                <td colspan="9" style="padding:6px 14px 10px 48px;">
                    <button class="add-bucket-btn" data-add-bucket="${realIdx}">+ Add Bucket</button>
                </td>
            </tr>`;

            // Totals row per cost code
            html += `<tr class="bucket-row cc-total-row" data-cc-parent="${realIdx}">
                <td></td>
                <td colspan="3" style="padding-left:14px;">${escapeHtml(cc.number)} Totals</td>
                <td style="text-align:right;">${formatCurrency(ccBudget)}</td>
                <td style="text-align:right;">${formatCurrency(ccActual)}</td>
                <td style="text-align:right;">${formatCurrency(ccCommitted)}</td>
                <td style="text-align:right;" class="bucket-amount ${ccRemCls}">${formatCurrency(ccRem)}</td>
                <td colspan="2"></td>
            </tr>`;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
        bindCostCodeEvents(container);
    }

    function bindCostCodeSearch(container) {
        const input = document.getElementById('costcode-search');
        if (input) {
            input.addEventListener('input', () => renderCostPage());
        }
        const addBtn = document.getElementById('btn-add-costcode');
        if (addBtn) {
            addBtn.addEventListener('click', openCostCodeModal);
        }
    }

    function bindCostCodeEvents(container) {
        const input = document.getElementById('costcode-search');
        if (input) {
            input.addEventListener('input', () => renderCostPage());
        }
        document.getElementById('btn-add-costcode').addEventListener('click', openCostCodeModal);

        // Tree toggle
        container.querySelectorAll('[data-toggle-cc]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = btn.dataset.toggleCc;
                const rows = container.querySelectorAll(`[data-cc-parent="${idx}"]`);
                rows.forEach(r => r.classList.toggle('open'));
                btn.classList.toggle('expanded');
            });
        });

        // ── Helper: update totals in-place after inline edit ──
        function updateCostCodeTotals(ccIdx) {
            const cc = job.costCodes[ccIdx];
            if (!cc) return;
            const buckets = ensureArray(cc.buckets);
            const cMap = calcCommittedMap();
            let ccBudget = 0, ccActual = 0, ccCommitted = 0;
            buckets.forEach(b => {
                ccBudget += Number(b.budget || 0);
                ccActual += Number(b.actual || 0);
                ccCommitted += getCommitted(cc.id, b.id, cMap);
            });
            const ccRem = ccBudget - ccCommitted;
            const ccRemCls = ccRem >= 0 ? 'positive' : 'negative';

            // Update header row
            const headerRow = container.querySelector(`[data-cc-header="${ccIdx}"]`);
            if (headerRow) {
                const cells = headerRow.querySelectorAll('td');
                if (cells.length >= 8) {
                    cells[4].textContent = formatCurrency(ccBudget);
                    cells[5].textContent = formatCurrency(ccActual);
                    cells[6].textContent = formatCurrency(ccCommitted);
                    cells[7].textContent = formatCurrency(ccRem);
                    cells[7].className = 'bucket-amount ' + ccRemCls;
                }
            }

            // Update totals row
            const totalRow = container.querySelector(`.cc-total-row[data-cc-parent="${ccIdx}"]`);
            if (totalRow) {
                const tds = totalRow.querySelectorAll('td');
                if (tds.length >= 8) {
                    tds[4].textContent = formatCurrency(ccBudget);
                    tds[5].textContent = formatCurrency(ccActual);
                    tds[6].textContent = formatCurrency(ccCommitted);
                    tds[7].textContent = formatCurrency(ccRem);
                    tds[7].className = 'bucket-amount ' + ccRemCls;
                }
            }
        }

        // ── Inline save on blur for budget/actual inputs ──
        container.querySelectorAll('[data-save-budget]').forEach(inp => {
            inp.addEventListener('blur', () => {
                const ccIdx = parseInt(inp.dataset.saveBudget);
                const bIdx = parseInt(inp.dataset.bucketIdx);
                const val = parseFloat(inp.value) || 0;
                if (job.costCodes[ccIdx] && job.costCodes[ccIdx].buckets[bIdx]) {
                    job.costCodes[ccIdx].buckets[bIdx].budget = val;
                    saveJobsToStorage();
                    // Recalculate remaining for this bucket
                    const cc = job.costCodes[ccIdx];
                    const committed = getCommitted(cc.id, cc.buckets[bIdx].id, calcCommittedMap());
                    const rem = val - committed;
                    const bucketRow = inp.closest('tr');
                    if (bucketRow) {
                        const remCell = bucketRow.querySelector('.bucket-amount');
                        if (remCell) {
                            remCell.textContent = formatCurrency(rem);
                            remCell.className = 'bucket-amount ' + (rem >= 0 ? 'positive' : 'negative');
                        }
                    }
                    updateCostCodeTotals(ccIdx);
                }
            });
            inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') inp.blur(); });
        });
        container.querySelectorAll('[data-save-actual]').forEach(inp => {
            inp.addEventListener('blur', () => {
                const ccIdx = parseInt(inp.dataset.saveActual);
                const bIdx = parseInt(inp.dataset.bucketIdx);
                const val = parseFloat(inp.value) || 0;
                if (job.costCodes[ccIdx] && job.costCodes[ccIdx].buckets[bIdx]) {
                    job.costCodes[ccIdx].buckets[bIdx].actual = val;
                    saveJobsToStorage();
                    updateCostCodeTotals(ccIdx);
                }
            });
            inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') inp.blur(); });
        });

        // Edit cost code
        container.querySelectorAll('[data-edit-costcode]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.editCostcode);
                const cc = job.costCodes[idx];
                editingCostCode = idx;
                document.getElementById('costcode-modal-title').textContent = 'Edit Cost Code';
                populateCostCodeForm(cc);
                openModal('costcode-overlay');
            });
        });

        // Delete cost code
        container.querySelectorAll('[data-del-costcode]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.delCostcode);
                const cc = job.costCodes[idx];
                if (confirm(`Delete cost code "${cc.number} - ${cc.name}" and all its buckets?`)) {
                    job.costCodes.splice(idx, 1);
                    saveJobsToStorage();
                    renderCostPage();
                }
            });
        });

        // Add bucket
        container.querySelectorAll('[data-add-bucket]').forEach(btn => {
            btn.addEventListener('click', () => {
                editingBucketCCIdx = parseInt(btn.dataset.addBucket);
                editingBucketIdx = null;
                document.getElementById('bucket-modal-title').textContent = 'Add Bucket';
                document.getElementById('bucket-name').value = '';
                document.getElementById('bucket-budget').value = '0';
                document.getElementById('bucket-actual').value = '0';
                document.getElementById('bucket-msg').textContent = '';
                openModal('bucket-overlay');
            });
        });

        // Edit bucket
        container.querySelectorAll('[data-edit-bucket]').forEach(btn => {
            btn.addEventListener('click', () => {
                const ccIdx = parseInt(btn.dataset.editBucket);
                const bIdx = parseInt(btn.dataset.bucketIdx);
                const bucket = job.costCodes[ccIdx].buckets[bIdx];
                editingBucketCCIdx = ccIdx;
                editingBucketIdx = bIdx;
                document.getElementById('bucket-modal-title').textContent = 'Edit Bucket';
                document.getElementById('bucket-name').value = bucket.name;
                document.getElementById('bucket-budget').value = bucket.budget || 0;
                document.getElementById('bucket-actual').value = bucket.actual || 0;
                document.getElementById('bucket-msg').textContent = '';
                openModal('bucket-overlay');
            });
        });

        // Delete bucket
        container.querySelectorAll('[data-del-bucket]').forEach(btn => {
            btn.addEventListener('click', () => {
                const ccIdx = parseInt(btn.dataset.delBucket);
                const bIdx = parseInt(btn.dataset.bucketIdx);
                const bucket = job.costCodes[ccIdx].buckets[bIdx];
                if (confirm(`Delete bucket "${bucket.name}"?`)) {
                    job.costCodes[ccIdx].buckets.splice(bIdx, 1);
                    saveJobsToStorage();
                    renderCostPage();
                }
            });
        });
    }

    // ── Commitments ──
    let editingCommitment = null;

    function renderCommitments(container) {
        const cmts = ensureArray(job.commitments);
        const codes = ensureArray(job.costCodes);

        let html = `
        <div style="display:flex;justify-content:flex-end;margin-bottom:16px;">
            <button class="btn-primary btn-sm" id="btn-add-commitment">Add Commitment</button>
            ${cmts.length > 0 ? `<span style="font-size:13px;color:var(--text-secondary);margin-right:12px;align-self:center;">${cmts.length} total</span>` : ''}
        </div>`;

        if (codes.length === 0) {
            html += `<div class="page-placeholder"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><h3>Create cost codes first</h3><p>You need at least one cost code with buckets before adding commitments.</p></div>`;
            container.innerHTML = html;
            document.getElementById('btn-add-commitment')?.addEventListener('click', () => openCommitmentModal(null));
            return;
        }

        if (cmts.length === 0) {
            html += `<div class="page-placeholder"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><h3>No commitments yet</h3><p>Create purchase orders and subcontracts assigned to cost code buckets.</p></div>`;
            container.innerHTML = html;
            document.getElementById('btn-add-commitment')?.addEventListener('click', () => openCommitmentModal(null));
            return;
        }

        html += `<table class="data-table"><thead><tr>
            <th>Type</th><th>Number</th><th>Title</th><th>Vendor</th><th style="text-align:right;">Amount</th><th>Cost Code</th><th>Bucket</th><th>Status</th><th></th>
        </tr></thead><tbody>`;

        cmts.forEach((c, i) => {
            const cc = codes.find(co => co.id === c.costCodeId);
            const ccName = cc ? (cc.number + ' - ' + cc.name) : '—';
            let bucketName = '—';
            if (cc) {
                const b = ensureArray(cc.buckets).find(bk => bk.id === c.bucketId);
                if (b) bucketName = b.name;
            }
            const typeCls = c.type === 'Purchase Order' ? 'po' : 'sub';
            html += `<tr>
                <td><span class="commitment-type-badge ${typeCls}">${c.type === 'Purchase Order' ? 'PO' : 'Sub'}</span></td>
                <td><strong>${escapeHtml(c.number)}</strong></td>
                <td>${escapeHtml(c.title)}</td>
                <td>${escapeHtml(c.vendor)}</td>
                <td style="text-align:right;font-weight:600;">${formatCurrency(c.amount)}</td>
                <td style="font-size:12px;">${escapeHtml(ccName)}</td>
                <td style="font-size:12px;">${escapeHtml(bucketName)}</td>
                <td><span class="status-badge ${c.status === 'Approved' ? 'approved' : c.status === 'Open' ? 'open' : 'closed'}">${escapeHtml(c.status)}</span></td>
                <td style="text-align:right;">
                    <button class="btn-icon" data-edit-cmt="${i}" title="Edit"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                    <button class="btn-icon" data-del-cmt="${i}" title="Delete"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                </td>
            </tr>`;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

        document.getElementById('btn-add-commitment').addEventListener('click', () => openCommitmentModal(null));

        container.querySelectorAll('[data-edit-cmt]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.editCmt);
                openCommitmentModal(idx);
            });
        });

        container.querySelectorAll('[data-del-cmt]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.delCmt);
                const c = job.commitments[idx];
                if (confirm(`Delete ${c.type} "${c.number}"?`)) {
                    job.commitments.splice(idx, 1);
                    saveJobsToStorage();
                    renderCostPage();
                }
            });
        });
    }

    function openCommitmentModal(editIdx) {
        editingCommitment = editIdx;
        const codes = ensureArray(job.costCodes);
        const modalTitle = document.getElementById('commitment-modal-title');
        const ccSelect = document.getElementById('commitment-costcode');
        const bucketSelect = document.getElementById('commitment-bucket');
        const msg = document.getElementById('commitment-msg');

        msg.textContent = '';

        if (editIdx !== null) {
            const c = job.commitments[editIdx];
            modalTitle.textContent = 'Edit Commitment';
            document.getElementById('commitment-type').value = c.type;
            document.getElementById('commitment-number').value = c.number;
            document.getElementById('commitment-title').value = c.title;
            document.getElementById('commitment-vendor').value = c.vendor;
            document.getElementById('commitment-amount').value = c.amount;
            document.getElementById('commitment-status').value = c.status;

            // Populate cost code select
            ccSelect.innerHTML = codes.map(co =>
                `<option value="${co.id}" ${co.id === c.costCodeId ? 'selected' : ''}>${co.number} - ${co.name}</option>`
            ).join('');

            // Populate bucket select
            const cc = codes.find(co => co.id === c.costCodeId);
            if (cc) {
                bucketSelect.innerHTML = ensureArray(cc.buckets).map(b =>
                    `<option value="${b.id}" ${b.id === c.bucketId ? 'selected' : ''}>${b.name}</option>`
                ).join('');
            } else {
                bucketSelect.innerHTML = '<option value="">—</option>';
            }
        } else {
            modalTitle.textContent = 'Add Commitment';
            document.getElementById('commitment-type').value = 'Purchase Order';
            document.getElementById('commitment-number').value = '';
            document.getElementById('commitment-title').value = '';
            document.getElementById('commitment-vendor').value = '';
            document.getElementById('commitment-amount').value = '';
            document.getElementById('commitment-status').value = 'Open';

            ccSelect.innerHTML = codes.map(co =>
                `<option value="${co.id}">${co.number} - ${co.name}</option>`
            ).join('');

            // Populate buckets for first cost code
            if (codes.length > 0) {
                const buckets = ensureArray(codes[0].buckets);
                bucketSelect.innerHTML = buckets.map(b =>
                    `<option value="${b.id}">${b.name}</option>`
                ).join('');
            } else {
                bucketSelect.innerHTML = '<option value="">—</option>';
            }
        }

        function updateBucketInfo() {
            const coId = parseInt(ccSelect.value);
            const bId = parseInt(bucketSelect.value);
            const cc = codes.find(co => co.id === coId);
            const info = document.getElementById('commitment-bucket-info');
            if (cc && bId) {
                const b = ensureArray(cc.buckets).find(bk => bk.id === bId);
                if (b) {
                    document.getElementById('cmt-budget-display').textContent = formatCurrency(b.budget || 0);
                    document.getElementById('cmt-actual-display').textContent = formatCurrency(b.actual || 0);
                    const committed = getCommitted(cc.id, b.id, calcCommittedMap());
                    document.getElementById('cmt-committed-display').textContent = formatCurrency(committed);
                    info.style.display = 'flex';
                    return;
                }
            }
            info.style.display = 'none';
        }

        // When cost code or bucket changes, update bucket options and info
        ccSelect.onchange = () => {
            const coId = parseInt(ccSelect.value);
            const cc = codes.find(co => co.id === coId);
            if (cc) {
                const buckets = ensureArray(cc.buckets);
                bucketSelect.innerHTML = buckets.map(b =>
                    `<option value="${b.id}">${b.name}</option>`
                ).join('');
            } else {
                bucketSelect.innerHTML = '<option value="">—</option>';
            }
            updateBucketInfo();
        };

        bucketSelect.onchange = updateBucketInfo;

        // Show initial bucket info
        updateBucketInfo();

        openModal('commitment-overlay');
    }

    document.getElementById('commitment-close').addEventListener('click', () => closeModal('commitment-overlay'));
    document.getElementById('commitment-overlay').addEventListener('click', (e) => { if (e.target.id === 'commitment-overlay') closeModal('commitment-overlay'); });
    document.getElementById('commitment-cancel').addEventListener('click', () => closeModal('commitment-overlay'));

    document.getElementById('commitment-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('commitment-type').value;
        const number = document.getElementById('commitment-number').value.trim();
        const title = document.getElementById('commitment-title').value.trim();
        const vendor = document.getElementById('commitment-vendor').value.trim();
        const amount = parseFloat(document.getElementById('commitment-amount').value) || 0;
        const status = document.getElementById('commitment-status').value;
        const costCodeId = parseInt(document.getElementById('commitment-costcode').value);
        const bucketId = parseInt(document.getElementById('commitment-bucket').value);
        const msg = document.getElementById('commitment-msg');

        if (!number || !title || !vendor || !costCodeId || !bucketId) {
            msg.textContent = 'Please fill in all required fields.';
            msg.className = 'settings-msg error';
            return;
        }

        reloadJob();
        if (!job.commitments) job.commitments = [];

        const data = { type, number, title, vendor, amount, status, costCodeId, bucketId };

        if (editingCommitment !== null) {
            const existing = job.commitments[editingCommitment];
            if (existing) Object.assign(existing, data);
            editingCommitment = null;
        } else {
            data.id = nextId(job.commitments);
            data.createdAt = new Date().toISOString();
            job.commitments.push(data);
        }

        saveJobsToStorage();
        closeModal('commitment-overlay');
        renderCostPage();
    });

    function openCostCodeModal() {
        editingCostCode = null;
        document.getElementById('costcode-modal-title').textContent = 'Add Cost Code';
        populateCostCodeForm(null);
        openModal('costcode-overlay');
    }

    function populateCostCodeForm(cc) {
        populateDivisionSelect('costcode-division', cc ? cc.division : '');
        document.getElementById('costcode-number').value = cc ? cc.number : '';
        document.getElementById('costcode-name').value = cc ? cc.name : '';
        document.getElementById('costcode-description').value = cc ? (cc.description || '') : '';
        document.getElementById('costcode-status').value = cc ? cc.status : 'Active';
        document.getElementById('costcode-sort').value = cc ? (cc.sortOrder || 0) : 0;
        document.getElementById('costcode-msg').textContent = '';
    }

    document.getElementById('costcode-close').addEventListener('click', () => closeModal('costcode-overlay'));
    document.getElementById('costcode-overlay').addEventListener('click', (e) => { if (e.target.id === 'costcode-overlay') closeModal('costcode-overlay'); });
    document.getElementById('costcode-cancel').addEventListener('click', () => closeModal('costcode-overlay'));

    document.getElementById('costcode-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const division = document.getElementById('costcode-division').value;
        const number = document.getElementById('costcode-number').value.trim();
        const name = document.getElementById('costcode-name').value.trim();
        const description = document.getElementById('costcode-description').value.trim();
        const status = document.getElementById('costcode-status').value;
        const sortOrder = parseInt(document.getElementById('costcode-sort').value) || 0;
        const msg = document.getElementById('costcode-msg');

        if (!number || !name) {
            msg.textContent = 'Cost code number and name are required.';
            msg.className = 'settings-msg error';
            return;
        }

        reloadJob();
        if (!job.costCodes) job.costCodes = [];

        if (editingCostCode !== null) {
            const existing = job.costCodes[editingCostCode];
            if (existing) {
                existing.division = division;
                existing.number = number;
                existing.name = name;
                existing.description = description;
                existing.status = status;
                existing.sortOrder = sortOrder;
            }
            editingCostCode = null;
        } else {
            const newCode = {
                id: nextId(job.costCodes),
                division,
                number,
                name,
                description,
                status,
                sortOrder,
                buckets: DEFAULT_BUCKETS.map((bn, i) => ({
                    id: i + 1,
                    name: bn,
                    budget: 0,
                    actual: 0
                })),
                createdAt: new Date().toISOString()
            };
            job.costCodes.push(newCode);
        }
        saveJobsToStorage();
        closeModal('costcode-overlay');
        renderCostPage();
    });

    // ── Bucket Form ──
    document.getElementById('bucket-close').addEventListener('click', () => closeModal('bucket-overlay'));
    document.getElementById('bucket-overlay').addEventListener('click', (e) => { if (e.target.id === 'bucket-overlay') closeModal('bucket-overlay'); });
    document.getElementById('bucket-cancel').addEventListener('click', () => closeModal('bucket-overlay'));

    document.getElementById('bucket-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('bucket-name').value.trim();
        const budget = parseFloat(document.getElementById('bucket-budget').value) || 0;
        const actual = parseFloat(document.getElementById('bucket-actual').value) || 0;
        const msg = document.getElementById('bucket-msg');

        if (!name) {
            msg.textContent = 'Bucket name is required.';
            msg.className = 'settings-msg error';
            return;
        }

        reloadJob();
        if (!job.costCodes) job.costCodes = [];
        const cc = job.costCodes[editingBucketCCIdx];
        if (!cc) return;
        if (!cc.buckets) cc.buckets = [];

        if (editingBucketIdx !== null && cc.buckets[editingBucketIdx]) {
            const b = cc.buckets[editingBucketIdx];
            b.name = name;
            b.budget = budget;
            b.actual = actual;
        } else {
            const found = cc.buckets.find(b => b.name === name);
            if (found) {
                found.budget = budget;
                found.actual = actual;
            } else {
                cc.buckets.push({ id: nextId(cc.buckets), name, budget, actual });
            }
        }

        saveJobsToStorage();
        closeModal('bucket-overlay');
        renderCostPage();
    });

    document.getElementById('cost-close').addEventListener('click', () => closeModal('cost-overlay'));
    document.getElementById('cost-overlay').addEventListener('click', (e) => { if (e.target.id === 'cost-overlay') closeModal('cost-overlay'); });
    document.getElementById('cost-cancel').addEventListener('click', () => closeModal('cost-overlay'));

    document.getElementById('cost-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const description = document.getElementById('cost-description').value.trim();
        const amount = parseFloat(document.getElementById('cost-amount').value);
        const category = document.getElementById('cost-category').value;
        const type = document.getElementById('cost-type').value;
        const msg = document.getElementById('cost-msg');

        if (!description || isNaN(amount)) {
            msg.textContent = 'Please fill in all required fields.';
            msg.className = 'settings-msg error';
            return;
        }

        reloadJob();
        if (!job.costItems) job.costItems = [];
        job.costItems.push({ id: nextId(job.costItems), category, description, amount, type, createdAt: new Date().toISOString() });
        saveJobsToStorage();
        closeModal('cost-overlay');
        renderCostPage();
    });

    // ── Change Orders Page ──
    let editingCO = null;

    function renderCOPage() {
        reloadJob();
        const container = document.getElementById('change-orders-content');
        const items = ensureArray(job.changeOrders);

        if (items.length === 0) {
            container.innerHTML = `<div class="page-placeholder"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg><h3>No change orders yet</h3><p>Track project changes and their financial impact here.</p></div>`;
            return;
        }

        let html = `<table class="data-table"><thead><tr><th>CO #</th><th>Title</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>`;
        items.forEach((co, i) => {
            html += `<tr>
                <td><strong>${escapeHtml(co.number)}</strong></td>
                <td>${escapeHtml(co.title)}</td>
                <td style="font-weight:600;">${formatCurrency(co.amount)}</td>
                <td><span class="status-badge ${co.status.toLowerCase().replace(/\s+/g, '-')}">${escapeHtml(co.status)}</span></td>
                <td style="text-align:right;">
                    <button class="btn-icon" data-edit-co="${i}" title="Edit"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                    <button class="btn-icon" data-del-co="${i}" title="Delete"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                </td>
            </tr>`;
        });
        html += `</tbody></table>`;
        container.innerHTML = html;

        container.querySelectorAll('[data-edit-co]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.editCo);
                const co = job.changeOrders[idx];
                editingCO = idx;
                document.getElementById('co-modal-title').textContent = 'Edit Change Order';
                document.getElementById('co-number').value = co.number;
                document.getElementById('co-title').value = co.title;
                document.getElementById('co-amount').value = co.amount;
                document.getElementById('co-status').value = co.status;
                document.getElementById('co-description').value = co.description || '';
                document.getElementById('co-msg').textContent = '';
                openModal('co-overlay');
            });
        });

        container.querySelectorAll('[data-del-co]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.delCo);
                if (confirm('Delete this change order?')) {
                    job.changeOrders.splice(idx, 1);
                    saveJobsToStorage();
                    renderCOPage();
                }
            });
        });
    }

    document.getElementById('btn-add-change-order').addEventListener('click', () => {
        editingCO = null;
        document.getElementById('co-modal-title').textContent = 'New Change Order';
        document.getElementById('co-number').value = '';
        document.getElementById('co-title').value = '';
        document.getElementById('co-amount').value = '';
        document.getElementById('co-status').value = 'Open';
        document.getElementById('co-description').value = '';
        document.getElementById('co-msg').textContent = '';
        openModal('co-overlay');
    });

    document.getElementById('co-close').addEventListener('click', () => closeModal('co-overlay'));
    document.getElementById('co-overlay').addEventListener('click', (e) => { if (e.target.id === 'co-overlay') closeModal('co-overlay'); });
    document.getElementById('co-cancel').addEventListener('click', () => closeModal('co-overlay'));

    document.getElementById('co-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const number = document.getElementById('co-number').value.trim();
        const title = document.getElementById('co-title').value.trim();
        const amount = parseFloat(document.getElementById('co-amount').value);
        const status = document.getElementById('co-status').value;
        const description = document.getElementById('co-description').value.trim();
        const msg = document.getElementById('co-msg');

        if (!number || !title || isNaN(amount)) {
            msg.textContent = 'Please fill in all required fields.';
            msg.className = 'settings-msg error';
            return;
        }

        reloadJob();
        if (!job.changeOrders) job.changeOrders = [];
        if (editingCO !== null) {
            const existing = job.changeOrders[editingCO];
            if (existing) {
                existing.number = number;
                existing.title = title;
                existing.amount = amount;
                existing.status = status;
                existing.description = description;
            }
            editingCO = null;
        } else {
            job.changeOrders.push({ id: nextId(job.changeOrders), number, title, amount, status, description, createdAt: new Date().toISOString() });
        }
        saveJobsToStorage();
        closeModal('co-overlay');
        renderCOPage();
    });

    // ── RFIs Page ──
    let editingRFI = null;

    function renderRFIsPage() {
        reloadJob();
        const container = document.getElementById('rfis-content');
        const items = ensureArray(job.rfis);

        if (items.length === 0) {
            container.innerHTML = `<div class="page-placeholder"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><h3>No RFIs yet</h3><p>Submit and track Requests for Information to architects and engineers.</p></div>`;
            return;
        }

        let html = `<table class="data-table"><thead><tr><th>RFI #</th><th>Subject</th><th>Status</th><th></th></tr></thead><tbody>`;
        items.forEach((rfi, i) => {
            html += `<tr>
                <td><strong>${escapeHtml(rfi.number)}</strong></td>
                <td>${escapeHtml(rfi.subject)}</td>
                <td><span class="status-badge ${rfi.status.toLowerCase().replace(/\s+/g, '-')}">${escapeHtml(rfi.status)}</span></td>
                <td style="text-align:right;">
                    <button class="btn-icon" data-edit-rfi="${i}" title="Edit"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                    <button class="btn-icon" data-del-rfi="${i}" title="Delete"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                </td>
            </tr>`;
        });
        html += `</tbody></table>`;
        container.innerHTML = html;

        container.querySelectorAll('[data-edit-rfi]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.editRfi);
                const rfi = job.rfis[idx];
                editingRFI = idx;
                document.getElementById('rfi-modal-title').textContent = 'Edit RFI';
                document.getElementById('rfi-number').value = rfi.number;
                document.getElementById('rfi-subject').value = rfi.subject;
                document.getElementById('rfi-status').value = rfi.status;
                document.getElementById('rfi-question').value = rfi.question || '';
                document.getElementById('rfi-answer').value = rfi.answer || '';
                document.getElementById('rfi-msg').textContent = '';
                openModal('rfi-overlay');
            });
        });

        container.querySelectorAll('[data-del-rfi]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.delRfi);
                if (confirm('Delete this RFI?')) {
                    job.rfis.splice(idx, 1);
                    saveJobsToStorage();
                    renderRFIsPage();
                }
            });
        });
    }

    document.getElementById('btn-add-rfi').addEventListener('click', () => {
        editingRFI = null;
        document.getElementById('rfi-modal-title').textContent = 'New RFI';
        document.getElementById('rfi-number').value = '';
        document.getElementById('rfi-subject').value = '';
        document.getElementById('rfi-status').value = 'Open';
        document.getElementById('rfi-question').value = '';
        document.getElementById('rfi-answer').value = '';
        document.getElementById('rfi-msg').textContent = '';
        openModal('rfi-overlay');
    });

    document.getElementById('rfi-close').addEventListener('click', () => closeModal('rfi-overlay'));
    document.getElementById('rfi-overlay').addEventListener('click', (e) => { if (e.target.id === 'rfi-overlay') closeModal('rfi-overlay'); });
    document.getElementById('rfi-cancel').addEventListener('click', () => closeModal('rfi-overlay'));

    document.getElementById('rfi-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const number = document.getElementById('rfi-number').value.trim();
        const subject = document.getElementById('rfi-subject').value.trim();
        const status = document.getElementById('rfi-status').value;
        const question = document.getElementById('rfi-question').value.trim();
        const answer = document.getElementById('rfi-answer').value.trim();
        const msg = document.getElementById('rfi-msg');

        if (!number || !subject) {
            msg.textContent = 'Please fill in all required fields.';
            msg.className = 'settings-msg error';
            return;
        }

        reloadJob();
        if (!job.rfis) job.rfis = [];
        if (editingRFI !== null) {
            const existing = job.rfis[editingRFI];
            if (existing) {
                existing.number = number;
                existing.subject = subject;
                existing.status = status;
                existing.question = question;
                existing.answer = answer;
            }
            editingRFI = null;
        } else {
            job.rfis.push({ id: nextId(job.rfis), number, subject, status, question, answer, createdAt: new Date().toISOString() });
        }
        saveJobsToStorage();
        closeModal('rfi-overlay');
        renderRFIsPage();
    });

    // ── Submittals Page ──
    let editingSub = null;

    function renderSubmittalsPage() {
        reloadJob();
        const container = document.getElementById('submittals-content');
        const items = ensureArray(job.submittals);

        if (items.length === 0) {
            container.innerHTML = `<div class="page-placeholder"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg><h3>No submittals yet</h3><p>Track material and equipment submittals through review and approval.</p></div>`;
            return;
        }

        let html = `<table class="data-table"><thead><tr><th>Sub #</th><th>Title</th><th>Status</th><th></th></tr></thead><tbody>`;
        items.forEach((sub, i) => {
            html += `<tr>
                <td><strong>${escapeHtml(sub.number)}</strong></td>
                <td>${escapeHtml(sub.title)}</td>
                <td><span class="status-badge ${sub.status.toLowerCase().replace(/\s+/g, '-')}">${escapeHtml(sub.status)}</span></td>
                <td style="text-align:right;">
                    <button class="btn-icon" data-edit-sub="${i}" title="Edit"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                    <button class="btn-icon" data-del-sub="${i}" title="Delete"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                </td>
            </tr>`;
        });
        html += `</tbody></table>`;
        container.innerHTML = html;

        container.querySelectorAll('[data-edit-sub]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.editSub);
                const sub = job.submittals[idx];
                editingSub = idx;
                document.getElementById('submittal-modal-title').textContent = 'Edit Submittal';
                document.getElementById('submittal-number').value = sub.number;
                document.getElementById('submittal-title').value = sub.title;
                document.getElementById('submittal-status').value = sub.status;
                document.getElementById('submittal-notes').value = sub.notes || '';
                document.getElementById('submittal-msg').textContent = '';
                openModal('submittal-overlay');
            });
        });

        container.querySelectorAll('[data-del-sub]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.delSub);
                if (confirm('Delete this submittal?')) {
                    job.submittals.splice(idx, 1);
                    saveJobsToStorage();
                    renderSubmittalsPage();
                }
            });
        });
    }

    document.getElementById('btn-add-submittal').addEventListener('click', () => {
        editingSub = null;
        document.getElementById('submittal-modal-title').textContent = 'New Submittal';
        document.getElementById('submittal-number').value = '';
        document.getElementById('submittal-title').value = '';
        document.getElementById('submittal-status').value = 'Open';
        document.getElementById('submittal-notes').value = '';
        document.getElementById('submittal-msg').textContent = '';
        openModal('submittal-overlay');
    });

    document.getElementById('submittal-close').addEventListener('click', () => closeModal('submittal-overlay'));
    document.getElementById('submittal-overlay').addEventListener('click', (e) => { if (e.target.id === 'submittal-overlay') closeModal('submittal-overlay'); });
    document.getElementById('submittal-cancel').addEventListener('click', () => closeModal('submittal-overlay'));

    document.getElementById('submittal-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const number = document.getElementById('submittal-number').value.trim();
        const title = document.getElementById('submittal-title').value.trim();
        const status = document.getElementById('submittal-status').value;
        const notes = document.getElementById('submittal-notes').value.trim();
        const msg = document.getElementById('submittal-msg');

        if (!number || !title) {
            msg.textContent = 'Please fill in all required fields.';
            msg.className = 'settings-msg error';
            return;
        }

        reloadJob();
        if (!job.submittals) job.submittals = [];
        if (editingSub !== null) {
            const existing = job.submittals[editingSub];
            if (existing) {
                existing.number = number;
                existing.title = title;
                existing.status = status;
                existing.notes = notes;
            }
            editingSub = null;
        } else {
            job.submittals.push({ id: nextId(job.submittals), number, title, status, notes, createdAt: new Date().toISOString() });
        }
        saveJobsToStorage();
        closeModal('submittal-overlay');
        renderSubmittalsPage();
    });

    // ── Punch List Page ──
    let editingPunch = null;

    function renderPunchListPage() {
        reloadJob();
        const container = document.getElementById('punch-list-content');
        const items = ensureArray(job.punchList);

        if (items.length === 0) {
            container.innerHTML = `<div class="page-placeholder"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><h3>No punch list items yet</h3><p>Track incomplete or corrective work items that need to be completed.</p></div>`;
            return;
        }

        const openItems = items.filter(i => i.status !== 'Closed');
        const closedItems = items.filter(i => i.status === 'Closed');

        let html = `<div style="margin-bottom:14px;"><span class="contacts-section-title">Open Items</span> <span class="contacts-count">${openItems.length}</span></div>`;

        if (openItems.length === 0) {
            html += `<p style="padding:12px 0;color:var(--text-secondary);font-size:13px;">All items completed!</p>`;
        } else {
            openItems.forEach((item, i) => {
                const realIdx = items.indexOf(item);
                html += renderPunchItem(item, realIdx);
            });
        }

        if (closedItems.length > 0) {
            html += `<div style="margin-top:24px;margin-bottom:14px;"><span class="contacts-section-title">Completed</span> <span class="contacts-count">${closedItems.length}</span></div>`;
            closedItems.forEach((item) => {
                const realIdx = items.indexOf(item);
                html += renderPunchItem(item, realIdx);
            });
        }

        container.innerHTML = html;
        bindPunchEvents(container);
    }

    function renderPunchItem(item, idx) {
        let statusClass = item.status.toLowerCase().replace(/\s+/g, '-');
        const assigneeName = item.assignee || 'Unassigned';
        return `
        <div class="punch-item">
            <div class="punch-check">
                <input type="checkbox" data-close-punch="${idx}" ${item.status === 'Closed' ? 'checked' : ''}>
            </div>
            <div class="punch-body">
                <div class="punch-title">${escapeHtml(item.title)}</div>
                <div class="punch-meta">
                    <span class="status-badge ${statusClass}">${escapeHtml(item.status)}</span>
                    <span>Assignee: ${escapeHtml(assigneeName)}</span>
                    ${item.description ? `<span>${escapeHtml(item.description)}</span>` : ''}
                </div>
            </div>
            <div class="punch-actions">
                <button class="btn-icon" data-edit-punch="${idx}" title="Edit"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                <button class="btn-icon" data-del-punch="${idx}" title="Delete"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
        </div>`;
    }

    function bindPunchEvents(container) {
        container.querySelectorAll('[data-close-punch]').forEach(cb => {
            cb.addEventListener('change', () => {
                const idx = parseInt(cb.dataset.closePunch);
                const item = job.punchList[idx];
                if (item) {
                    item.status = cb.checked ? 'Closed' : 'Open';
                    saveJobsToStorage();
                    renderPunchListPage();
                }
            });
        });

        container.querySelectorAll('[data-edit-punch]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.editPunch);
                const item = job.punchList[idx];
                editingPunch = idx;
                populatePunchForm(item);
                openModal('punch-overlay');
            });
        });

        container.querySelectorAll('[data-del-punch]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.delPunch);
                if (confirm('Delete this punch list item?')) {
                    job.punchList.splice(idx, 1);
                    saveJobsToStorage();
                    renderPunchListPage();
                }
            });
        });
    }

    function populatePunchForm(item) {
        document.getElementById('punch-modal-title').textContent = editingPunch !== null ? 'Edit Punch List Item' : 'New Punch List Item';
        document.getElementById('punch-title').value = item ? item.title : '';
        document.getElementById('punch-assignee').value = item ? (item.assignee || '') : '';
        document.getElementById('punch-status').value = item ? item.status : 'Open';
        document.getElementById('punch-description').value = item ? (item.description || '') : '';
        document.getElementById('punch-msg').textContent = '';
    }

    document.getElementById('btn-add-punch-item').addEventListener('click', () => {
        editingPunch = null;
        // Populate assignee dropdown
        const sel = document.getElementById('punch-assignee');
        sel.innerHTML = '<option value="">Unassigned</option>';
        ensureArray(job.members).forEach(m => {
            sel.innerHTML += `<option value="${escapeHtml(m.email)}">${escapeHtml(m.firstName)} ${escapeHtml(m.lastName)}</option>`;
        });
        populatePunchForm(null);
        openModal('punch-overlay');
    });

    document.getElementById('punch-close').addEventListener('click', () => closeModal('punch-overlay'));
    document.getElementById('punch-overlay').addEventListener('click', (e) => { if (e.target.id === 'punch-overlay') closeModal('punch-overlay'); });
    document.getElementById('punch-cancel').addEventListener('click', () => closeModal('punch-overlay'));

    document.getElementById('punch-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('punch-title').value.trim();
        const assignee = document.getElementById('punch-assignee').value;
        const status = document.getElementById('punch-status').value;
        const description = document.getElementById('punch-description').value.trim();
        const msg = document.getElementById('punch-msg');

        if (!title) {
            msg.textContent = 'Please enter a title.';
            msg.className = 'settings-msg error';
            return;
        }

        reloadJob();
        if (!job.punchList) job.punchList = [];
        if (editingPunch !== null) {
            const existing = job.punchList[editingPunch];
            if (existing) {
                existing.title = title;
                existing.assignee = assignee;
                existing.status = status;
                existing.description = description;
            }
            editingPunch = null;
        } else {
            job.punchList.push({ id: nextId(job.punchList), title, assignee, status, description, createdAt: new Date().toISOString() });
        }
        saveJobsToStorage();
        closeModal('punch-overlay');
        renderPunchListPage();
    });

    // ── Schedule / Milestones Page ──
    let editingMilestone = null;

    function renderSchedulePage() {
        reloadJob();
        const container = document.getElementById('schedule-content');
        const items = ensureArray(job.milestones);

        if (items.length === 0) {
            container.innerHTML = `<div class="page-placeholder"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><h3>No milestones yet</h3><p>Add project milestones to track progress against your schedule.</p></div>`;
            return;
        }

        let html = `<div class="milestone-list">`;
        items.forEach((ms, i) => {
            const start = new Date(ms.startDate + 'T00:00:00');
            const end = new Date(ms.endDate + 'T00:00:00');
            const total = end - start;
            const elapsed = Date.now() - start.getTime();
            let progress = 0;
            if (ms.status === 'Complete') {
                progress = 100;
            } else if (ms.status === 'Not Started') {
                progress = 0;
            } else if (total > 0) {
                progress = Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
            }
            const statusClass = ms.status.toLowerCase().replace(/\s+/g, '-');

            html += `
            <div class="milestone-item">
                <div class="milestone-title">${escapeHtml(ms.title)}</div>
                <div class="milestone-dates">${ms.startDate} &mdash; ${ms.endDate}</div>
                <div class="milestone-bar-wrap">
                    <div class="milestone-bar-label">
                        <span class="status-badge ${statusClass}">${escapeHtml(ms.status)}</span>
                        <span>${progress}%</span>
                    </div>
                    <div class="milestone-bar">
                        <div class="milestone-bar-fill ${statusClass}" style="width:${progress}%"></div>
                    </div>
                </div>
                <button class="btn-icon" data-edit-ms="${i}" title="Edit"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                <button class="btn-icon" data-del-ms="${i}" title="Delete"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>`;
        });
        html += `</div>`;
        container.innerHTML = html;

        container.querySelectorAll('[data-edit-ms]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.editMs);
                const ms = job.milestones[idx];
                editingMilestone = idx;
                document.getElementById('milestone-modal-title').textContent = 'Edit Milestone';
                document.getElementById('milestone-title').value = ms.title;
                document.getElementById('milestone-start').value = ms.startDate;
                document.getElementById('milestone-end').value = ms.endDate;
                document.getElementById('milestone-status').value = ms.status;
                document.getElementById('milestone-msg').textContent = '';
                openModal('milestone-overlay');
            });
        });

        container.querySelectorAll('[data-del-ms]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.delMs);
                if (confirm('Delete this milestone?')) {
                    job.milestones.splice(idx, 1);
                    saveJobsToStorage();
                    renderSchedulePage();
                }
            });
        });
    }

    document.getElementById('btn-add-milestone').addEventListener('click', () => {
        editingMilestone = null;
        document.getElementById('milestone-modal-title').textContent = 'Add Milestone';
        document.getElementById('milestone-title').value = '';
        document.getElementById('milestone-start').value = '';
        document.getElementById('milestone-end').value = '';
        document.getElementById('milestone-status').value = 'Not Started';
        document.getElementById('milestone-msg').textContent = '';
        openModal('milestone-overlay');
    });

    document.getElementById('milestone-close').addEventListener('click', () => closeModal('milestone-overlay'));
    document.getElementById('milestone-overlay').addEventListener('click', (e) => { if (e.target.id === 'milestone-overlay') closeModal('milestone-overlay'); });
    document.getElementById('milestone-cancel').addEventListener('click', () => closeModal('milestone-overlay'));

    document.getElementById('milestone-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('milestone-title').value.trim();
        const startDate = document.getElementById('milestone-start').value;
        const endDate = document.getElementById('milestone-end').value;
        const status = document.getElementById('milestone-status').value;
        const msg = document.getElementById('milestone-msg');

        if (!title || !startDate || !endDate) {
            msg.textContent = 'Please fill in all required fields.';
            msg.className = 'settings-msg error';
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            msg.textContent = 'End date must be after start date.';
            msg.className = 'settings-msg error';
            return;
        }

        reloadJob();
        if (!job.milestones) job.milestones = [];
        if (editingMilestone !== null) {
            const existing = job.milestones[editingMilestone];
            if (existing) {
                existing.title = title;
                existing.startDate = startDate;
                existing.endDate = endDate;
                existing.status = status;
            }
            editingMilestone = null;
        } else {
            job.milestones.push({ id: nextId(job.milestones), title, startDate, endDate, status, createdAt: new Date().toISOString() });
        }
        saveJobsToStorage();
        closeModal('milestone-overlay');
        renderSchedulePage();
    });

    // ── Daily Logs Page ──
    let editingLog = null;

    function renderDailyLogsPage() {
        reloadJob();
        const container = document.getElementById('daily-logs-content');
        const items = ensureArray(job.dailyLogs);

        if (items.length === 0) {
            container.innerHTML = `<div class="page-placeholder"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg><h3>No daily log entries yet</h3><p>Record daily activities, weather, crew counts, and site notes.</p></div>`;
            return;
        }

        let html = '';
        items.slice().reverse().forEach((log, displayIdx) => {
            const realIdx = items.length - 1 - displayIdx;
            const author = log.createdBy === user.email ? 'You' : (log.createdByName || log.createdBy);
            const logDate = log.logDate ? new Date(log.logDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

            html += `
            <div class="log-entry">
                <div class="log-entry-header">
                    <div>
                        <span class="log-date">${logDate}</span>
                        <span class="log-author">by ${escapeHtml(author)}</span>
                    </div>
                    <div style="display:flex;gap:6px;">
                        <button class="btn-icon" data-edit-log="${realIdx}" title="Edit"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                        <button class="btn-icon" data-del-log="${realIdx}" title="Delete"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                    </div>
                </div>
                <p>${escapeHtml(log.content)}</p>
            </div>`;
        });

        container.innerHTML = html;

        container.querySelectorAll('[data-edit-log]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.editLog);
                const log = job.dailyLogs[idx];
                editingLog = idx;
                document.getElementById('log-modal-title').textContent = 'Edit Log Entry';
                document.getElementById('log-date').value = log.logDate || '';
                document.getElementById('log-content').value = log.content || '';
                document.getElementById('log-msg').textContent = '';
                openModal('log-overlay');
            });
        });

        container.querySelectorAll('[data-del-log]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.delLog);
                if (confirm('Delete this log entry?')) {
                    job.dailyLogs.splice(idx, 1);
                    saveJobsToStorage();
                    renderDailyLogsPage();
                }
            });
        });
    }

    // ── Daily Log Form handlers ──
    document.getElementById('btn-add-log-entry').addEventListener('click', () => {
        editingLog = null;
        document.getElementById('log-modal-title').textContent = 'New Log Entry';
        document.getElementById('log-date').value = new Date().toISOString().slice(0, 10);
        document.getElementById('log-content').value = '';
        document.getElementById('log-msg').textContent = '';
        openModal('log-overlay');
    });

    function setupLogModal() {
        document.getElementById('log-close').addEventListener('click', () => closeModal('log-overlay'));
        document.getElementById('log-overlay').addEventListener('click', (e) => { if (e.target.id === 'log-overlay') closeModal('log-overlay'); });
        document.getElementById('log-cancel').addEventListener('click', () => closeModal('log-overlay'));

        document.getElementById('log-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const logDate = document.getElementById('log-date').value;
            const content = document.getElementById('log-content').value.trim();
            const msg = document.getElementById('log-msg');

            if (!logDate || !content) {
                msg.textContent = 'Please fill in all fields.';
                msg.className = 'settings-msg error';
                return;
            }

            reloadJob();
            if (!job.dailyLogs) job.dailyLogs = [];
            const logEntry = {
                id: nextId(job.dailyLogs),
                logDate,
                content,
                createdBy: user.email,
                createdByName: user.firstName + ' ' + user.lastName,
                createdAt: new Date().toISOString()
            };
            if (editingLog !== null) {
                const existing = job.dailyLogs[editingLog];
                if (existing) {
                    existing.logDate = logDate;
                    existing.content = content;
                }
                editingLog = null;
            } else {
                job.dailyLogs.push(logEntry);
            }
            saveJobsToStorage();
            closeModal('log-overlay');
            renderDailyLogsPage();
        });
    }
    setupLogModal();

    // ── Placeholder Pages ──
    function renderPlaceholder(containerId, icon, title, desc) {
        document.getElementById(containerId).innerHTML = `
        <div class="page-placeholder">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">${icon}</svg>
            <h3>${title}</h3>
            <p>${desc}</p>
        </div>`;
    }

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
