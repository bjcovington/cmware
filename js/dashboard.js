document.addEventListener('DOMContentLoaded', () => {
    const userRaw = localStorage.getItem('cmware_current_user');
    if (!userRaw) {
        window.location.href = '../index.html';
        return;
    }

    const user = JSON.parse(userRaw);
    const initials = (user.firstName[0] + user.lastName[0]).toUpperCase();

    // ── User Menu ──
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

    // ── Jobs Helpers ──
    function refreshTopbar() {
        const initials = (user.firstName[0] + user.lastName[0]).toUpperCase();
        const userAvatarEl = document.getElementById('user-avatar');
        if (user.avatar) {
            userAvatarEl.innerHTML = `<img src="${user.avatar}" alt="${user.firstName}">`;
        } else {
            userAvatarEl.textContent = initials;
        }
        document.getElementById('user-name').textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById('dropdown-header').textContent = user.email;
    }

    function getJobs() {
        return JSON.parse(localStorage.getItem('cmware_jobs') || '[]');
    }

    function saveJobs(jobs) {
        localStorage.setItem('cmware_jobs', JSON.stringify(jobs));
    }

    function getAllUsers() {
        return JSON.parse(localStorage.getItem('cmware_users') || '[]');
    }

    function generateJobNumber() {
        const jobs = getJobs();
        const mainNumbers = jobs.map(j => parseInt(j.jobNumber.split('.')[0], 10));
        const maxNum = mainNumbers.length > 0 ? Math.max(...mainNumbers) : 24000;
        return `${maxNum + 1}.01`;
    }

    function getUserForEmail(email) {
        const users = getAllUsers();
        return users.find(u => u.email === email);
    }

    // ── Render Jobs ──
    function getJobsForUser() {
        const allJobs = getJobs();
        return allJobs.filter(job =>
            job.createdBy === user.email ||
            job.members.some(m => m.email === user.email)
        );
    }

    function renderJobs() {
        const jobs = getJobsForUser();
        const emptyState = document.getElementById('empty-state');
        const jobsSection = document.getElementById('jobs-section');

        if (jobs.length === 0) {
            emptyState.style.display = 'flex';
            jobsSection.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            jobsSection.style.display = 'block';
            renderJobsGrid(jobs);
        }
    }

    function renderJobsGrid(jobs) {
        const grid = document.getElementById('jobs-grid');
        grid.innerHTML = '';

        jobs.forEach(job => {
            const card = document.createElement('div');
            card.className = 'job-card';

            const statusClass = 'status-' + job.status.toLowerCase().replace(/\s+/g, '-');
            const dateStr = job.startDate
                ? new Date(job.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'TBD';

            const locationParts = [job.city, job.state].filter(Boolean).join(', ');
            const location = locationParts || job.address || 'No location set';

            // Build member avatars
            let memberAvatarsHtml = '';
            const displayMembers = job.members.slice(0, 4);
            displayMembers.forEach(m => {
                const memberUser = getUserForEmail(m.email);
                if (memberUser && memberUser.avatar) {
                    memberAvatarsHtml += `<div class="member-avatar-sm"><img src="${memberUser.avatar}" alt=""></div>`;
                } else {
                    const mi = (m.firstName[0] + m.lastName[0]).toUpperCase();
                    memberAvatarsHtml += `<div class="member-avatar-sm">${mi}</div>`;
                }
            });

            const remainingCount = job.members.length - displayMembers.length;
            const countText = remainingCount > 0 ? `+${remainingCount} more` : '';

            card.innerHTML = `
                <div class="job-card-header">
                    <span class="job-card-number">${job.jobNumber}</span>
                    <span class="job-card-status ${statusClass}">${job.status}</span>
                </div>
                <div class="job-card-title">${escapeHtml(job.name)}</div>
                <div class="job-card-client">${escapeHtml(job.client)}</div>
                <div class="job-card-meta">
                    <span class="job-card-meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        ${dateStr}
                    </span>
                    <span class="job-card-meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        ${escapeHtml(location)}
                    </span>
                </div>
                ${job.members.length > 0 ? `
                <div class="job-card-members">
                    <div class="member-avatars">${memberAvatarsHtml}</div>
                    <span class="member-count">${job.members.length} member${job.members.length !== 1 ? 's' : ''} ${countText}</span>
                </div>` : ''}
            `;

            card.addEventListener('click', () => {
                window.location.href = `job.html?jobId=${job.id}`;
            });

            grid.appendChild(card);
        });
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ── Action Dropdown ──
    const actionToggle = document.getElementById('btn-action-toggle');
    const actionDropdown = document.getElementById('action-dropdown');

    actionToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        actionDropdown.classList.toggle('open');
    });

    document.addEventListener('click', () => {
        actionDropdown.classList.remove('open');
    });

    // ── Search ──
    const searchInput = document.getElementById('search-input');
    const noResults = document.getElementById('no-results');

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        const cards = document.querySelectorAll('.job-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            const match = !query || text.includes(query);
            card.style.display = match ? '' : 'none';
            if (match) visibleCount++;
        });

        noResults.style.display = (query && visibleCount === 0) ? 'block' : 'none';
    });

    // ── Create Job Modal ──
    const modalOverlay = document.getElementById('modal-overlay');
    const createModal = document.getElementById('create-job-modal');
    const createForm = document.getElementById('create-job-form');
    const jobNumberInput = document.getElementById('job-number');

    jobNumberInput.addEventListener('input', () => {
        jobNumberInput.style.borderColor = '';
    });

    function openCreateModal() {
        createForm.reset();
        document.getElementById('members-list').innerHTML = '';
        modalMembers = [];
        jobNumberInput.value = generateJobNumber();
        document.getElementById('job-status').value = 'Planning';
        customTypesRow.style.display = 'none';
        jobTypeCustomGroup.style.display = 'none';
        projectTypeCustomGroup.style.display = 'none';
        jobTypeCustomInput.required = false;
        projectTypeCustomInput.required = false;
        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeCreateModal() {
        modalOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    document.getElementById('btn-create-job').addEventListener('click', openCreateModal);
    document.getElementById('btn-create-job-2').addEventListener('click', openCreateModal);
    document.getElementById('btn-create-job-3').addEventListener('click', () => {
        actionDropdown.classList.remove('open');
        openCreateModal();
    });
    document.getElementById('modal-close').addEventListener('click', closeCreateModal);
    document.getElementById('btn-cancel').addEventListener('click', closeCreateModal);

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeCreateModal();
    });

    // ── Join Job Modal ──
    const joinOverlay = document.getElementById('join-modal-overlay');
    const joinForm = document.getElementById('join-job-form');

    function openJoinModal() {
        const joinBody = document.querySelector('#join-modal-overlay .modal-body');
        joinBody.innerHTML = `
            <form id="join-job-form">
                <div class="form-group">
                    <label for="join-job-number">Job Number</label>
                    <input type="text" id="join-job-number" placeholder="e.g. 24001.01" required>
                    <span class="form-hint">Enter the full job number (e.g. 24001.01)</span>
                </div>
                <div id="join-error" class="error-message"></div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" id="btn-join-cancel">Cancel</button>
                    <button type="submit" class="btn-primary">Join Project</button>
                </div>
            </form>
        `;
        document.getElementById('btn-join-cancel').addEventListener('click', closeJoinModal);
        document.getElementById('join-job-form').addEventListener('submit', handleJoinSubmit);
        joinOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeJoinModal() {
        joinOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    document.getElementById('btn-join-job').addEventListener('click', openJoinModal);
    document.getElementById('btn-join-job-2').addEventListener('click', () => {
        actionDropdown.classList.remove('open');
        openJoinModal();
    });
    document.getElementById('join-modal-close').addEventListener('click', closeJoinModal);

    joinOverlay.addEventListener('click', (e) => {
        if (e.target === joinOverlay) closeJoinModal();
    });

    function handleJoinSubmit(e) {
        e.preventDefault();
        const jobNumber = document.getElementById('join-job-number').value.trim();
        const errorEl = document.getElementById('join-error');

        if (!jobNumber) {
            errorEl.textContent = 'Please enter a job number.';
            return;
        }

        const jobs = getJobs();
        const job = jobs.find(j => j.jobNumber === jobNumber);

        if (!job) {
            errorEl.textContent = 'No project found with that job number.';
            return;
        }

        if (job.members.some(m => m.email === user.email) || job.createdBy === user.email) {
            errorEl.textContent = 'You are already a member of this project.';
            return;
        }

        if (!job.joinRequests) job.joinRequests = [];

        if (job.joinRequests.some(r => r.email === user.email)) {
            errorEl.textContent = 'Your request to join is already pending approval.';
            return;
        }

        job.joinRequests.push({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            company: user.company || '',
            requestedAt: new Date().toISOString()
        });

        saveJobs(jobs);

        // Show confirmation inside the modal
        const joinBody = document.querySelector('#join-modal-overlay .modal-body');
        const savedJobName = job.name;
        joinBody.innerHTML = `
            <div style="text-align:center;padding:28px 8px;">
                <svg viewBox="0 0 60 60" width="56" height="56" style="margin-bottom:14px;">
                    <circle cx="30" cy="30" r="28" fill="none" stroke="var(--google-green)" stroke-width="2.5" stroke-dasharray="176" stroke-dashoffset="176" style="animation: confirmCircle 0.6s ease-out 0.1s forwards;"/>
                    <polyline points="18,31 26,39 42,22" fill="none" stroke="var(--google-green)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="50" stroke-dashoffset="50" style="animation: confirmCheck 0.35s ease-out 0.55s forwards;"/>
                </svg>
                <h3 style="font-size:16px;color:var(--text-primary);margin-bottom:6px;">Request Sent</h3>
                <p style="font-size:13px;color:var(--text-secondary);margin-bottom:20px;">Your request to join <strong>${escapeHtml(savedJobName)}</strong> has been sent.<br>You'll appear on the project once an Owner or Manager approves.</p>
                <button class="btn-primary" id="join-confirm-done">Done</button>
            </div>
        `;
        document.getElementById('join-confirm-done').addEventListener('click', () => {
            closeJoinModal();
            renderJobs();
        });

        if (!document.getElementById('confirm-keyframes')) {
            const style = document.createElement('style');
            style.id = 'confirm-keyframes';
            style.textContent = `
                @keyframes confirmCircle { to { stroke-dashoffset: 0; } }
                @keyframes confirmCheck { to { stroke-dashoffset: 0; } }
            `;
            document.head.appendChild(style);
        }
    }

    // ── Members in Create Modal ──
    let modalMembers = [];
    const memberEmailInput = document.getElementById('member-email-input');
    const membersList = document.getElementById('members-list');

    function renderModalMembers() {
        membersList.innerHTML = '';
        modalMembers.forEach((m, i) => {
            const tag = document.createElement('span');
            tag.className = 'member-tag' + (m.email === user.email ? ' is-you' : '');
            tag.innerHTML = `${escapeHtml(m.firstName)} ${escapeHtml(m.lastName)} &lt;${escapeHtml(m.email)}&gt;`;
            if (m.email !== user.email) {
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-member';
                removeBtn.innerHTML = '&times;';
                removeBtn.addEventListener('click', () => {
                    modalMembers.splice(i, 1);
                    renderModalMembers();
                });
                tag.appendChild(removeBtn);
            }
            membersList.appendChild(tag);
        });
    }

    document.getElementById('btn-add-member').addEventListener('click', () => {
        const email = memberEmailInput.value.trim().toLowerCase();
        if (!email) return;

        if (modalMembers.some(m => m.email === email)) {
            return;
        }

        const existingUser = getUserForEmail(email);

        modalMembers.push({
            email,
            firstName: existingUser ? existingUser.firstName : email.split('@')[0],
            lastName: existingUser ? existingUser.lastName : '',
            role: 'Member',
            company: existingUser ? (existingUser.company || '') : ''
        });

        memberEmailInput.value = '';
        renderModalMembers();
    });

    memberEmailInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('btn-add-member').click();
        }
    });

    // ── "Other" type toggle ──
    const jobTypeSelect = document.getElementById('job-type');
    const jobTypeCustomGroup = document.getElementById('job-type-custom-group');
    const jobTypeCustomInput = document.getElementById('job-type-custom');
    const projectTypeSelect = document.getElementById('job-project-type');
    const projectTypeCustomGroup = document.getElementById('project-type-custom-group');
    const projectTypeCustomInput = document.getElementById('project-type-custom');
    const customTypesRow = document.getElementById('custom-types-row');

    function updateCustomTypesRow() {
        const showJob = jobTypeSelect.value === 'Other';
        const showProj = projectTypeSelect.value === 'Other';
        jobTypeCustomGroup.style.display = showJob ? '' : 'none';
        projectTypeCustomGroup.style.display = showProj ? '' : 'none';
        customTypesRow.style.display = (showJob || showProj) ? '' : 'none';
        jobTypeCustomInput.required = showJob;
        projectTypeCustomInput.required = showProj;
        if (!showJob) jobTypeCustomInput.value = '';
        if (!showProj) projectTypeCustomInput.value = '';
    }

    jobTypeSelect.addEventListener('change', updateCustomTypesRow);
    projectTypeSelect.addEventListener('change', updateCustomTypesRow);

    // ── Create Job Submit ──
    createForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const jobNumberVal = jobNumberInput.value.trim();
        if (!jobNumberVal) {
            jobNumberInput.focus();
            return;
        }

        const jobs = getJobs();
        if (jobs.some(j => j.jobNumber === jobNumberVal)) {
            jobNumberInput.style.borderColor = 'var(--google-red)';
            jobNumberInput.focus();
            return;
        }
        jobNumberInput.style.borderColor = '';

        const job = {
            id: Date.now().toString(),
            jobNumber: jobNumberVal,
            name: document.getElementById('job-name').value.trim(),
            description: document.getElementById('job-description').value.trim(),
            client: document.getElementById('job-client').value.trim(),
            address: document.getElementById('job-address').value.trim(),
            city: document.getElementById('job-city').value.trim(),
            state: document.getElementById('job-state').value.trim().toUpperCase(),
            zip: document.getElementById('job-zip').value.trim(),
            jobType: jobTypeSelect.value === 'Other' ? jobTypeCustomInput.value.trim() : jobTypeSelect.value,
            projectType: projectTypeSelect.value === 'Other' ? projectTypeCustomInput.value.trim() : projectTypeSelect.value,
            status: document.getElementById('job-status').value,
            startDate: document.getElementById('job-start-date').value,
            endDate: document.getElementById('job-end-date').value,
            members: [...modalMembers],
            createdBy: user.email,
            joinRequests: [],
            createdAt: new Date().toISOString()
        };

        // Auto-add creator if not already in members
        if (!job.members.some(m => m.email === user.email)) {
            const creatorRole = document.getElementById('creator-role').value;
            job.members.unshift({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: creatorRole,
                company: user.company || ''
            });
        }

        jobs.push(job);
        saveJobs(jobs);

        closeCreateModal();
        renderJobs();
    });

    // ── Settings Modal ──
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

        // Also update in the users array
        const users = getAllUsers();
        const idx = users.findIndex(u => u.id === user.id);
        if (idx !== -1) {
            users[idx] = { ...users[idx], ...updatedFields };
        } else {
            users.push({ ...user });
        }
        localStorage.setItem('cmware_users', JSON.stringify(users));

        // Update topbar UI
        refreshTopbar();
    }

    document.getElementById('settings-btn').addEventListener('click', openSettingsModal);
    document.getElementById('settings-modal-close').addEventListener('click', closeSettingsModal);

    settingsOverlay.addEventListener('click', (e) => {
        if (e.target === settingsOverlay) closeSettingsModal();
    });

    // Settings tabs
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.settings-tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById('settings-tab-' + tab.dataset.settingsTab).classList.add('active');
        });
    });

    // Avatar upload in settings
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

    // Phone formatting in settings
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

    // Save profile
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

        // Check email uniqueness if changed
        if (email !== user.email) {
            const users = getAllUsers();
            if (users.some(u => u.email === email && u.id !== user.id)) {
                msgEl.textContent = 'An account with this email already exists.';
                msgEl.className = 'settings-msg error';
                return;
            }

            // Update createdBy in all jobs
            const jobs = getJobs();
            jobs.forEach(job => {
                if (job.createdBy === user.email) job.createdBy = email;
                job.members.forEach(m => {
                    if (m.email === user.email) m.email = email;
                });
            });
            saveJobs(jobs);
        }

        updateCurrentUser({ firstName, lastName, email, phone, company, avatar: settingsNewAvatar });

        msgEl.textContent = 'Profile saved successfully!';
        msgEl.className = 'settings-msg success';
    });

    // Save password
    settingsPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const msgEl = document.getElementById('settings-password-msg');

        const currentPw = document.getElementById('settings-current-pw').value;
        const newPw = document.getElementById('settings-new-pw').value;
        const confirmPw = document.getElementById('settings-confirm-pw').value;

        const users = getAllUsers();
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
    renderJobs();
});
