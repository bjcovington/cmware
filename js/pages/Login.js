import { auth } from "../auth.js";
import { Card } from "../components/Card.js";

export class Login {
    render() {
        return `
            <div class="auth-page">
                <div class="auth-card">
                    <div class="auth-header">
                        <div class="auth-logo">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="48" height="48" rx="12" fill="var(--color-primary)"/>
                                <path d="M14 20L22 28L34 16" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <h1>Welcome Back</h1>
                        <p class="auth-subtitle">Sign in to cmware Construction Manager</p>
                    </div>

                    <form id="form-login" class="auth-form">
                        <div class="field">
                            <label for="login-email">Email Address</label>
                            <input class="input" id="login-email" name="email" type="email" required placeholder="you@company.com" autocomplete="email">
                        </div>

                        <div class="field">
                            <label for="login-password">Password</label>
                            <input class="input" id="login-password" name="password" type="password" required placeholder="Enter your password" autocomplete="current-password">
                        </div>

                        <div class="form-options">
                            <label class="checkbox-wrapper">
                                <input type="checkbox" name="remember" id="login-remember">
                                <span class="checkbox-check"><i data-lucide="check"></i></span>
                                <span>Remember me</span>
                            </label>
                            <a href="#/forgot-password" class="forgot-link">Forgot password?</a>
                        </div>

                        <button class="button primary auth-submit" type="submit">
                            <i data-lucide="log-in"></i> Sign In
                        </button>
                    </form>

                    <div class="auth-divider">
                        <span>Demo Accounts</span>
                    </div>

                    <div class="demo-accounts">
                        <button type="button" class="demo-account" data-email="marcus.vance@apexconstruct.com" data-password="password123">
                            <span class="demo-avatar">MV</span>
                            <div>
                                <strong>Marcus Vance</strong>
                                <span>Senior PM • Apex Construction</span>
                            </div>
                        </button>
                        <button type="button" class="demo-account" data-email="sjenkins@designstudio.com" data-password="password123">
                            <span class="demo-avatar">SJ</span>
                            <div>
                                <strong>Sarah Jenkins</strong>
                                <span>Lead Architect • Design Studio</span>
                            </div>
                        </button>
                        <button type="button" class="demo-account" data-email="dmiller@millereng.com" data-password="password123">
                            <span class="demo-avatar">DM</span>
                            <div>
                                <strong>David Miller</strong>
                                <span>Structural Engineer • Miller & Associates</span>
                            </div>
                        </button>
                        <button type="button" class="demo-account" data-email="carlos@voltelectric.com" data-password="password123">
                            <span class="demo-avatar">CR</span>
                            <div>
                                <strong>Carlos Rodriguez</strong>
                                <span>Electrical Lead • Volt Electric</span>
                            </div>
                        </button>
                    </div>

                    <p class="auth-footer">
                        Don't have an account? <a href="#/signup">Create one</a>
                    </p>
                </div>
            </div>
        `;
    }

    bind({ route, params }) {
        const form = document.getElementById("form-login");
        form?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(form).entries());
            const result = await auth.login(data.email, data.password);
            if (result.success) {
                document.dispatchEvent(new CustomEvent("toast", { detail: `Welcome back, ${result.user.name}!` }));
                location.hash = "#/dashboard";
            } else {
                document.dispatchEvent(new CustomEvent("toast", { detail: result.message }));
            }
        });

        document.querySelectorAll(".demo-account").forEach(btn => {
            btn.addEventListener("click", async () => {
                const email = btn.dataset.email;
                const password = btn.dataset.password;
                const result = await auth.login(email, password);
                if (result.success) {
                    document.dispatchEvent(new CustomEvent("toast", { detail: `Signed in as ${result.user.name}` }));
                    location.hash = "#/dashboard";
                }
            });
        });

        window.lucide?.createIcons();
    }
}