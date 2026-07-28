import { auth } from "../auth.js";
import { Card } from "../components/Card.js";

export class Profile {
    render() {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
            return `<div class="page-loading">Please sign in to view your profile</div>`;
        }

        const avatarHtml = currentUser.profilePicture
            ? `<img src="${currentUser.profilePicture}" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
            : `<div class="avatar-circle large" style="background:var(--color-primary)">${currentUser.avatar || currentUser.name?.slice(0,2).toUpperCase() || "US"}</div>`;

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Account</span>
                    <h1>My Profile</h1>
                    <p>Manage your personal information, profile picture, and account settings</p>
                </div>
            </section>

            <div class="page-grid" style="grid-template-columns: 1fr;">
                <section class="card">
                    <div class="card-header">
                        <div>
                            <span class="eyebrow">Profile Picture</span>
                            <h2 class="card-title">Avatar</h2>
                        </div>
                    </div>
                    <div class="profile-avatar-section">
                        <div class="avatar-preview-large" id="avatar-preview-large">
                            ${avatarHtml}
                        </div>
                        <div class="avatar-actions">
                            <label class="button primary" for="profile-avatar">
                                <i data-lucide="upload"></i> Change Photo
                            </label>
                            ${currentUser.profilePicture ? `<button class="button ghost" id="btn-remove-avatar" type="button"><i data-lucide="trash-2"></i> Remove Photo</button>` : ""}
                        </div>
                        <input type="file" id="profile-avatar" name="avatar" accept="image/*" style="display: none;" hidden>
                        <p class="muted" style="margin-top: 0.5rem;">Supported formats: JPG, PNG. Max size: 2MB. Recommended: 400x400px.</p>
                    </div>
                </section>

                <section class="card">
                    ${Card.render({
                        title: "Personal Information",
                        eyebrow: "Editable",
                        body: `
                            <form id="form-profile" class="record-form">
                                <div class="form-grid">
                                    <div class="field">
                                        <label for="pf-firstName">First Name <span class="required">*</span></label>
                                        <input class="input" id="pf-firstName" name="firstName" required value="${this._esc(currentUser.firstName || currentUser.name?.split(" ")[0] || "")}" autocomplete="given-name">
                                    </div>
                                    <div class="field">
                                        <label for="pf-lastName">Last Name <span class="required">*</span></label>
                                        <input class="input" id="pf-lastName" name="lastName" required value="${this._esc(currentUser.lastName || currentUser.name?.split(" ").slice(1).join(" ") || "")}" autocomplete="family-name">
                                    </div>
                                </div>

                                <div class="field">
                                    <label for="pf-email">Email Address <span class="required">*</span></label>
                                    <input class="input" id="pf-email" name="email" type="email" required value="${this._esc(currentUser.email || "")}" autocomplete="email">
                                </div>

                                <div class="field">
                                    <label for="pf-phone">Phone Number</label>
                                    <input class="input" id="pf-phone" name="phoneNumber" type="tel" value="${this._esc(currentUser.phoneNumber || "")}" placeholder="(555) 123-4567" autocomplete="tel">
                                </div>

                                <div class="form-grid">
                                    <div class="field">
                                        <label for="pf-company">Company</label>
                                        <input class="input" id="pf-company" name="company" value="${this._esc(currentUser.company || "")}" autocomplete="organization">
                                    </div>
                                    <div class="field">
                                        <label for="pf-role">Role</label>
                                        <input class="input" id="pf-role" name="role" value="${this._esc(currentUser.role || "")}" placeholder="e.g. Project Manager">
                                    </div>
                                </div>

                                <div class="split" style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--color-border);">
                                    <span></span>
                                    <button class="button primary" type="submit"><i data-lucide="save"></i> Save Changes</button>
                                </div>
                            </form>
                        `
                    })}
                </section>

                <section class="card">
                    ${Card.render({
                        title: "Account Security",
                        eyebrow: "Password & Sessions",
                        body: `
                            <form id="form-password" class="record-form">
                                <div class="field">
                                    <label for="pf-current-pass">Current Password</label>
                                    <input class="input" id="pf-current-pass" name="currentPassword" type="password" autocomplete="current-password" placeholder="Enter current password">
                                </div>
                                <div class="form-grid">
                                    <div class="field">
                                        <label for="pf-new-pass">New Password</label>
                                        <input class="input" id="pf-new-pass" name="newPassword" type="password" autocomplete="new-password" placeholder="New password (min 8 chars)" minlength="8">
                                    </div>
                                    <div class="field">
                                        <label for="pf-confirm-pass">Confirm New Password</label>
                                        <input class="input" id="pf-confirm-pass" name="confirmPassword" type="password" autocomplete="new-password" placeholder="Confirm new password">
                                    </div>
                                </div>
                                <div class="split" style="margin-top: 1rem;">
                                    <span></span>
                                    <button class="button secondary" type="submit"><i data-lucide="lock"></i> Update Password</button>
                                </div>
                            </form>
                            <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--color-border);">
                                <button class="button ghost danger" id="btn-logout-all" type="button"><i data-lucide="log-out"></i> Log Out of All Sessions</button>
                            </div>
                        `
                    })}
                </section>

                <section class="card">
                    ${Card.render({
                        title: "Danger Zone",
                        eyebrow: "Irreversible actions",
                        actions: `<span class="badge danger">Permanent</span>`,
                        body: `
                            <p class="muted">Once you delete your account, there is no going back. All your data will be permanently removed.</p>
                            <button class="button danger" id="btn-delete-account" type="button"><i data-lucide="trash-2"></i> Delete My Account</button>
                        `
                    })}
                </section>
            </div>
        `;
    }

    bind() {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) return;

        const avatarInput = document.getElementById("profile-avatar");
        const avatarPreview = document.getElementById("avatar-preview-large");
        const removeAvatarBtn = document.getElementById("btn-remove-avatar");
        let newAvatarDataUrl = currentUser.profilePicture || null;

        avatarInput?.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                if (!file.type.startsWith("image/")) {
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Please select an image file" }));
                    return;
                }
                if (file.size > 2 * 1024 * 1024) {
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Image must be less than 2MB" }));
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    newAvatarDataUrl = event.target.result;
                    avatarPreview.innerHTML = `<img src="${newAvatarDataUrl}" alt="Profile preview" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
                    if (removeAvatarBtn) removeAvatarBtn.style.display = "";
                };
                reader.readAsDataURL(file);
            }
        });

        removeAvatarBtn?.addEventListener("click", () => {
            newAvatarDataUrl = null;
            const initials = (currentUser.name || "US").split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) || "US";
            avatarPreview.innerHTML = `<div class="avatar-circle large" style="background:var(--color-primary)">${initials}</div>`;
            removeAvatarBtn.style.display = "none";
            avatarInput.value = "";
        });

        // Profile form
        document.getElementById("form-profile")?.addEventListener("submit", (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target).entries());

            const updatedUser = {
                ...currentUser,
                firstName: data.firstName,
                lastName: data.lastName,
                name: `${data.firstName} ${data.lastName}`.trim(),
                email: data.email,
                phoneNumber: data.phoneNumber,
                company: data.company,
                role: data.role,
                profilePicture: newAvatarDataUrl
            };

            auth.setCurrentUser(updatedUser);
            // Update in users list
            const users = auth.getUsers();
            const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
            localStorage.setItem("cmware_users", JSON.stringify(updatedUsers));

            document.dispatchEvent(new CustomEvent("toast", { detail: "Profile updated successfully" }));
            location.hash = "#/profile";
        });

        // Password form
        document.getElementById("form-password")?.addEventListener("submit", (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target).entries());

            if (data.newPassword !== data.confirmPassword) {
                document.dispatchEvent(new CustomEvent("toast", { detail: "Passwords do not match" }));
                return;
            }
            if (data.newPassword.length < 8) {
                document.dispatchEvent(new CustomEvent("toast", { detail: "Password must be at least 8 characters" }));
                return;
            }

            // In a real app, verify current password and hash new one
            document.dispatchEvent(new CustomEvent("toast", { detail: "Password updated (demo mode - not persisted)" }));
            e.target.reset();
        });

        // Logout all sessions
        document.getElementById("btn-logout-all")?.addEventListener("click", () => {
            if (confirm("Log out of all sessions? You will need to sign in again.")) {
                auth.logout();
                document.dispatchEvent(new CustomEvent("toast", { detail: "Logged out of all sessions" }));
                location.hash = "#/login";
            }
        });

        // Delete account
        document.getElementById("btn-delete-account")?.addEventListener("click", () => {
            if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                if (confirm("This will permanently delete your account and all associated data. Type 'DELETE' to confirm.")) {
                    const users = auth.getUsers().filter(u => u.id !== currentUser.id);
                    localStorage.setItem("cmware_users", JSON.stringify(users));
                    auth.logout();
                    document.dispatchEvent(new CustomEvent("toast", { detail: "Account deleted" }));
                    location.hash = "#/login";
                }
            }
        });

        window.lucide?.createIcons();
    }

    _esc(val) {
        return String(val ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;");
    }
}