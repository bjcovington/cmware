import { auth } from "../auth.js";

export class LoginPage {
    constructor() {
        this.mode = "login";
    }

    render({ params }) {
        this.mode = params.get("mode") || "login";
        if (auth.getCurrentUser() && this.mode === "login") {
            setTimeout(() => location.hash = "#/dashboard", 0);
            return `<div class="page-loading">Redirecting...</div>`;
        }
        return this.mode === "signup" ? this.renderSignup() : this.renderLogin();
    }

    renderLogin() {
        return `
            <div class="auth-page">
                <div class="auth-card">
                    <div class="auth-header">
                        <div class="auth-brand">
                            <i data-lucide="hard-hat" class="brand-icon"></i>
                            <span>cmware</span>
                        </div>
                        <h1>Welcome Back</h1>
                        <p>Sign in to access your construction projects</p>
                    </div>
                    <form id="form-login" class="auth-form">
                        <div class="field">
                            <label for="login-email">Email Address</label>
                            <input class="input" id="login-email" name="email" type="email" required autocomplete="email" placeholder="you@company.com">
                        </div>
                        <div class="field">
                            <label for="login-pass">Password</label>
                            <input class="input" id="login-pass" name="password" type="password" required autocomplete="current-password" placeholder="••••••••">
                        </div>
                        <div class="auth-options">
                            <label class="checkbox-inline">
                                <input type="checkbox" name="remember"> Remember me
                            </label>
                            <a href="#/login?mode=forgot" class="link">Forgot password?</a>
                        </div>
                        <button class="button primary full-width" type="submit"><i data-lucide="log-in"></i> Sign In</button>
                    </form>
                    <div class="auth-footer">
                        <p>Don't have an account? <a href="#/login?mode=signup">Create one</a></p>
                    </div>
                    <div class="auth-demo">
                        <p class="muted">Demo Accounts:</p>
                        <div class="demo-buttons">
                            <button class="button ghost small" data-demo="marcus.vance@apexconstruct.com"><i data-lucide="user"></i> Marcus Vance (PM)</button>
                            <button class="button ghost small" data-demo="sjenkins@designstudio.com"><i data-lucide="user"></i> Sarah Jenkins (Architect)</button>
                            <button class="button ghost small" data-demo="dmiller@millereng.com"><i data-lucide="user"></i> David Miller (Engineer)</button>
                            <button class="button ghost small" data-demo="carlos@voltelectric.com"><i data-lucide="user"></i> Carlos Rodriguez (Trade)</button>
                        </div>
                        <p class="muted small">All passwords: <code>password123</code></p>
                    </div>
                </div>
            </div>
        `;
    }

    renderSignup() {
        return `
            <div class="auth-page">
                <div class="auth-card">
                    <div class="auth-header">
                        <a href="#/login" class="auth-back"><i data-lucide="chevron-left"></i></a>
                        <div class="auth-brand">
                            <i data-lucide="hard-hat" class="brand-icon"></i>
                            <span>cmware</span>
                        </div>
                        <h1>Create Account</h1>
                        <p>Join your construction project team</p>
                    </div>
                    <form id="form-signup" class="auth-form">
                        <div class="field">
                            <label for="su-name">Full Name</label>
                            <input class="input" id="su-name" name="name" required autocomplete="name" placeholder="Alex Morgan">
                        </div>
                        <div class="field">
                            <label for="su-email">Email Address</label>
                            <input class="input" id="su-email" name="email" type="email" required autocomplete="email" placeholder="alex@company.com">
                        </div>
                        <div class="form-grid">
                            <div class="field">
                                <label for="su-company">Company</label>
                                <input class="input" id="su-company" name="company" required placeholder="Apex Construction">
                            </div>
                            <div class="field">
                                <label for="su-role">Your Role</label>
                                <input class="input" id="su-role" name="role" required placeholder="Project Manager">
                            </div>
                        </div>
                        <div class="field">
                            <label for="su-pass">Password</label>
                            <input class="input" id="su-pass" name="password" type="password" required autocomplete="new-password" placeholder="Create a strong password" minlength="8">
                        </div>
                        <div class="field">
                            <label for="su-confirm">Confirm Password</label>
                            <input class="input" id="su-confirm" type="password" required autocomplete="new-password" placeholder="Confirm password">
                        </div>
                        <button class="button primary full-width" type="submit"><i data-lucide="user-plus"></i> Create Account</button>
                    </form>
                    <div class="auth-footer">
                        <p>Already have an account? <a href="#/login">Sign in</a></p>
                    </div>
                </div>
            </div>
        `;
    }

    bind({ route, params }) {
        this.mode = params.get("mode") || "login";

        const form = document.getElementById(this.mode === "signup" ? "form-signup" : "form-login");
        form?.addEventListener("submit", (e) => this.handleSubmit(e, form));

        // Demo account buttons
        document.querySelectorAll("[data-demo]").forEach(btn => {
            btn.addEventListener("click", () => {
                const email = btn.dataset.demo;
                document.getElementById("login-email").value = email;
                document.getElementById("login-pass").value = "password123";
                document.getElementById("form-login").dispatchEvent(new Event("submit"));
            });
        });

        // Password confirmation validation
        const confirmInput = document.getElementById("su-confirm");
        confirmInput?.addEventListener("input", () => {
            const pass = document.getElementById("su-pass");
            confirmInput.setCustomValidity(pass.value === confirmInput.value ? "" : "Passwords do not match");
        });
    }

    handleSubmit(e, form) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());

        if (this.mode === "signup") {
            if (data.password !== data.confirm) {
                document.dispatchEvent(new CustomEvent("toast", { detail: "Passwords do not match" }));
                return;
            }
            const result = auth.signup({
                name: data.name,
                email: data.email,
                company: data.company,
                role: data.role,
                password: data.password
            });
            if (result.success) {
                document.dispatchEvent(new CustomEvent("toast", { detail: `Welcome, ${result.user.name}!` }));
                location.hash = "#/dashboard";
            } else {
                document.dispatchEvent(new CustomEvent("toast", { detail: result.message }));
            }
        } else {
            const result = auth.login(data.email, data.password);
            if (result.success) {
                document.dispatchEvent(new CustomEvent("toast", { detail: `Welcome back, ${result.user.name}!` }));
                location.hash = "#/dashboard";
            } else {
                document.dispatchEvent(new CustomEvent("toast", { detail: result.message }));
            }
        }
    }
}