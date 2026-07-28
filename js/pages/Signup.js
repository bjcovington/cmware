import { auth } from "../auth.js";
import { Card } from "../components/Card.js";

export class Signup {
    render() {
        return `
            <div class="auth-page">
                <div class="auth-card">
                    <div class="auth-header">
                        <a href="#/login" class="auth-back"><i data-lucide="chevron-left"></i></a>
                        <div class="auth-logo">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="48" height="48" rx="12" fill="var(--color-primary)"/>
                                <path d="M14 20L22 28L34 16" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <h1>Create Your Account</h1>
                        <p class="auth-subtitle">Join cmware Construction Manager</p>
                    </div>

                    <form id="form-signup" class="auth-form">
                        <div class="settings-section-label">Personal Information</div>
                        
                        <div class="field">
                            <label for="su-avatar">Profile Picture <span class="optional">(optional)</span></label>
                            <div class="avatar-upload-wrapper">
                                <div class="avatar-preview" id="signup-avatar-preview">
                                    <i data-lucide="camera" style="width:24px;height:24px;"></i>
                                </div>
                                <label class="button secondary" style="cursor:pointer;">
                                    <i data-lucide="upload"></i> Choose Photo
                                    <input type="file" id="su-avatar" name="avatar" accept="image/*" style="display:none;">
                                </label>
                            </div>
                        </div>

                        <div class="form-grid">
                            <div class="field">
                                <label for="su-firstName">First Name <span class="required">*</span></label>
                                <input class="input" id="su-firstName" name="firstName" required placeholder="Alex" autocomplete="given-name">
                            </div>
                            <div class="field">
                                <label for="su-lastName">Last Name <span class="required">*</span></label>
                                <input class="input" id="su-lastName" name="lastName" required placeholder="Morgan" autocomplete="family-name">
                            </div>
                        </div>

                        <div class="field">
                            <label for="su-email">Email Address <span class="required">*</span></label>
                            <input class="input" id="su-email" name="email" type="email" required placeholder="alex@company.com" autocomplete="email">
                        </div>

                        <div class="field">
                            <label for="su-phone">Phone Number <span class="optional">(optional)</span></label>
                            <input class="input" id="su-phone" name="phoneNumber" type="tel" placeholder="(555) 123-4567" autocomplete="tel">
                        </div>

                        <div class="settings-section-label" style="margin-top:1.25rem;">Professional Information</div>

                        <div class="form-grid">
                            <div class="field">
                                <label for="su-company">Company <span class="required">*</span></label>
                                <input class="input" id="su-company" name="company" required placeholder="Apex Construction" autocomplete="organization">
                            </div>
                            <div class="field">
                                <label for="su-role">Role <span class="required">*</span></label>
                                <select class="select" id="su-role" name="role" required>
                                    <option value="">Select your role</option>
                                    <option value="Project Executive">Project Executive</option>
                                    <option value="Senior Project Manager">Senior Project Manager</option>
                                    <option value="Project Manager">Project Manager</option>
                                    <option value="Assistant Project Manager">Assistant Project Manager</option>
                                    <option value="Superintendent">Superintendent</option>
                                    <option value="Assistant Superintendent">Assistant Superintendent</option>
                                    <option value="Project Engineer">Project Engineer</option>
                                    <option value="Field Engineer">Field Engineer</option>
                                    <option value="Estimator">Estimator</option>
                                    <option value="Preconstruction Manager">Preconstruction Manager</option>
                                    <option value="Scheduler">Scheduler</option>
                                    <option value="BIM Manager">BIM Manager</option>
                                    <option value="Safety Manager">Safety Manager</option>
                                    <option value="Quality Manager">Quality Manager</option>
                                    <option value="Owner Representative">Owner Representative</option>
                                    <option value="Architect">Architect</option>
                                    <option value="Engineer">Engineer</option>
                                    <option value="Subcontractor Project Manager">Subcontractor PM</option>
                                    <option value="Subcontractor Superintendent">Subcontractor Superintendent</option>
                                    <option value="Foreman">Foreman</option>
                                    <option value="Trade Foreman">Trade Foreman</option>
                                    <option value="Vendor Representative">Vendor Representative</option>
                                    <option value="Consultant">Consultant</option>
                                    <option value="Inspector">Inspector</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div class="settings-section-label" style="margin-top:1.25rem;">Account Security</div>

                        <div class="field">
                            <label for="su-pass">Password <span class="required">*</span></label>
                            <input class="input" id="su-pass" name="password" type="password" required placeholder="Create a strong password" autocomplete="new-password" minlength="8">
                            <p class="field-hint">Minimum 8 characters</p>
                        </div>

                        <div class="field">
                            <label for="su-confirm">Confirm Password <span class="required">*</span></label>
                            <input class="input" id="su-confirm" name="confirmPassword" type="password" required placeholder="Confirm your password" autocomplete="new-password">
                        </div>

                        <div class="field">
                            <label class="checkbox-wrapper">
                                <input type="checkbox" name="terms" id="su-terms" required>
                                <span class="checkbox-check"><i data-lucide="check"></i></span>
                                <span>I agree to the <a href="#/terms">Terms of Service</a> and <a href="#/privacy">Privacy Policy</a></span>
                            </label>
                        </div>

                        <button class="button primary auth-submit" type="submit">
                            <i data-lucide="user-plus"></i> Create Account
                        </button>
                    </form>

                    <p class="auth-footer">
                        Already have an account? <a href="#/login">Sign in</a>
                    </p>
                </div>
            </div>
        `;
    }

    bind({ route, params }) {
        const form = document.getElementById("form-signup");
        const avatarInput = document.getElementById("su-avatar");
        const avatarPreview = document.getElementById("signup-avatar-preview");
        let avatarDataUrl = null;

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
                    avatarDataUrl = event.target.result;
                    avatarPreview.innerHTML = `<img src="${avatarDataUrl}" alt="Profile preview" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
                };
                reader.readAsDataURL(file);
            }
        });

        form?.addEventListener("submit", (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(form).entries());

            if (data.password !== data.confirmPassword) {
                document.dispatchEvent(new CustomEvent("toast", { detail: "Passwords do not match" }));
                return;
            }

            if (data.password.length < 8) {
                document.dispatchEvent(new CustomEvent("toast", { detail: "Password must be at least 8 characters" }));
                return;
            }

            const { confirmPassword, terms, avatar, ...userData } = data;
            if (avatarDataUrl) {
                userData.profilePicture = avatarDataUrl;
            }

            auth.signup(userData).then((result) => {
                if (result.success) {
                    document.dispatchEvent(new CustomEvent("toast", { detail: `Account created! Welcome, ${result.user.name}` }));
                    location.hash = "#/dashboard";
                } else {
                    document.dispatchEvent(new CustomEvent("toast", { detail: result.message }));
                }
            });
        });

        window.lucide?.createIcons();
    }
}