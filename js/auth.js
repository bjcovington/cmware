import { STORAGE_KEYS } from "./constants.js";

const DEFAULT_USERS = [
    {
        id: "usr-001",
        name: "Marcus Vance",
        email: "marcus.vance@apexconstruct.com",
        company: "Apex Construction",
        role: "Senior Project Manager",
        avatar: "MV",
        password: "password123"
    },
    {
        id: "usr-002",
        name: "Sarah Jenkins",
        email: "sjenkins@designstudio.com",
        company: "Design Studio International",
        role: "Lead Architect",
        avatar: "SJ",
        password: "password123"
    },
    {
        id: "usr-003",
        name: "David Miller",
        email: "dmiller@millereng.com",
        company: "Miller & Associates Engineers",
        role: "Structural Engineer",
        avatar: "DM",
        password: "password123"
    },
    {
        id: "usr-004",
        name: "Carlos Rodriguez",
        email: "carlos@voltelectric.com",
        company: "Volt Electric Inc.",
        role: "Electrical Trade Lead",
        avatar: "CR",
        password: "password123"
    }
];

export const auth = {
    getUsers() {
        const stored = localStorage.getItem("cmware_users");
        if (!stored) {
            localStorage.setItem("cmware_users", JSON.stringify(DEFAULT_USERS));
            return DEFAULT_USERS;
        }
        try {
            return JSON.parse(stored);
        } catch {
            localStorage.setItem("cmware_users", JSON.stringify(DEFAULT_USERS));
            return DEFAULT_USERS;
        }
    },

    getCurrentUser() {
        const stored = localStorage.getItem(STORAGE_KEYS.user || "cmware_current_user");
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                // fallback
            }
        }
        const defaultUser = this.getUsers()[0];
        this.setCurrentUser(defaultUser);
        return defaultUser;
    },

    setCurrentUser(user) {
        localStorage.setItem(STORAGE_KEYS.user || "cmware_current_user", JSON.stringify(user));
        document.dispatchEvent(new CustomEvent("user-changed", { detail: user }));
    },

    login(email, password) {
        const users = this.getUsers();
        const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
        if (!found) {
            return { success: false, message: "User not found. Check email or sign up." };
        }
        if (found.password && found.password !== password) {
            return { success: false, message: "Incorrect password." };
        }
        this.setCurrentUser(found);
        return { success: true, user: found };
    },

    signup({ name, email, company, role, password }) {
        const users = this.getUsers();
        if (users.some((u) => u.email.toLowerCase() === email.toLowerCase().trim())) {
            return { success: false, message: "An account with this email already exists." };
        }

        const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "US";
        const newUser = {
            id: `usr-${Date.now()}`,
            name,
            email,
            company: company || "General Contractor",
            role: role || "Project Team Member",
            avatar: initials,
            password: password || "password123"
        };

        const updatedUsers = [...users, newUser];
        localStorage.setItem("cmware_users", JSON.stringify(updatedUsers));
        this.setCurrentUser(newUser);
        return { success: true, user: newUser };
    },

    logout() {
        localStorage.removeItem(STORAGE_KEYS.user || "cmware_current_user");
        document.dispatchEvent(new CustomEvent("user-changed", { detail: null }));
    }
};
