import { db } from "./db.js";
import { STORAGE_KEYS } from "./constants.js";

async function sha256Hex(str) {
  const enc = new TextEncoder().encode(str || "");
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const LOCKOUT_THRESHOLD = 6; // failed attempts before lock
const LOCKOUT_MINUTES = 15;

export const auth = {
  async init() {
    // migrate existing localStorage seed data into IndexedDB if needed
    await db.migrateFromLocalStorage(STORAGE_KEYS);

    // if users exist in DB, copy them into localStorage for compatibility
    try {
      const users = await db.getAll("users");
      if (users && users.length) {
        // if localStorage doesn't have users, or to keep in-sync, write users to localStorage
        localStorage.setItem("cmware_users", JSON.stringify(users.map(u => ({
          id: u.id,
          name: u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim(),
          email: u.email,
          company: u.company,
          role: u.role,
          avatar: u.avatar || ((u.firstName||"")[0] || "U") + ((u.lastName||"")[0] || "S"),
          // keep password field only for legacy items (not the hashed value)
          password: undefined
        }))));

        // ensure there's at least one admin user
        if (!users.find(u => (u.role || "").toLowerCase().includes("admin"))) {
          const admin = {
            id: `usr-admin`,
            name: "System Administrator",
            email: "admin@local",
            company: "Local",
            role: "System Administrator",
            avatar: "SA",
            passwordHash: await sha256Hex("admin123"),
            createdAt: new Date().toISOString(),
            isActive: true,
            failedAttempts: 0,
            lockedUntil: null,
            loginHistory: []
          };
          await db.put("users", admin);
          // update localStorage list
          const newUsers = await db.getAll("users");
          localStorage.setItem("cmware_users", JSON.stringify(newUsers.map(u => ({ id: u.id, name: u.name, email: u.email, company: u.company, role: u.role, avatar: u.avatar }))));
        }
      }
    } catch (e) {
      // ignore
    }

    // ensure current user is set
    if (!localStorage.getItem(STORAGE_KEYS.user)) {
      const existing = JSON.parse(localStorage.getItem("cmware_users") || "[]");
      if (existing && existing.length) {
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(existing[0]));
        document.dispatchEvent(new CustomEvent("user-changed", { detail: existing[0] }));
      }
    }

    this._startInactivityWatcher();
  },

  // Synchronous read helpers to preserve existing UI expectations
  getUsers() {
    const stored = localStorage.getItem("cmware_users");
    if (!stored) return [];
    try { return JSON.parse(stored); } catch { return []; }
  },

  getCurrentUser() {
    const stored = localStorage.getItem(STORAGE_KEYS.user || "cmware_current_user");
    if (stored) {
      try { return JSON.parse(stored); } catch {}
    }
    const defaultUser = this.getUsers()[0] || null;
    if (defaultUser) this.setCurrentUser(defaultUser);
    return defaultUser;
  },

  setCurrentUser(user) {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.user);
      document.dispatchEvent(new CustomEvent("user-changed", { detail: null }));
      return;
    }
    const safe = {
      id: user.id,
      name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      email: user.email,
      company: user.company,
      role: user.role,
      avatar: user.avatar || ((user.firstName||"")[0] || "U") + ((user.lastName||"")[0] || "S")
    };
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(safe));
    document.dispatchEvent(new CustomEvent("user-changed", { detail: safe }));
  },

  async login(email, password) {
    // try to find family in DB first
    try {
      const users = await db.getAll("users");
      const found = users.find((u) => (u.email || "").toLowerCase() === (email || "").toLowerCase().trim());
      if (!found) return { success: false, message: "User not found. Check email or sign up." };
      if (!found.isActive) return { success: false, message: "Account inactive." };

      if (found.lockedUntil && new Date(found.lockedUntil) > new Date()) {
        return { success: false, message: `Account locked until ${found.lockedUntil}.` };
      }

      const hash = await sha256Hex(password);
      if (found.passwordHash && found.passwordHash !== hash) {
        found.failedAttempts = (found.failedAttempts || 0) + 1;
        if (found.failedAttempts >= LOCKOUT_THRESHOLD) {
          found.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString();
        }
        await db.put("users", found);
        return { success: false, message: "Incorrect password." };
      }

      // success
      found.failedAttempts = 0;
      found.lockedUntil = null;
      found.lastLogin = new Date().toISOString();
      found.loginHistory = (found.loginHistory || []).slice(-49).concat([{ at: found.lastLogin, ip: "local" }]);
      await db.put("users", found);

      // update localStorage compatibility lists
      const usersList = (await db.getAll("users")).map(u => ({ id: u.id, name: u.name, email: u.email, company: u.company, role: u.role, avatar: u.avatar }));
      localStorage.setItem("cmware_users", JSON.stringify(usersList));

      await this.setCurrentUser(found);

      // activity
      await db.put("activity", { id: `act-${Date.now()}-${Math.random()}`, timestamp: new Date().toISOString(), userId: found.id, action: "login", detail: "User logged in" });
      return { success: true, user: found };
    } catch (err) {
      // fallback to legacy localStorage-based auth
      const users = this.getUsers();
      const found = users.find((u) => (u.email || "").toLowerCase() === (email || "").toLowerCase().trim());
      if (!found) return { success: false, message: "User not found. Check email or sign up." };
      if (found.password && found.password !== password) return { success: false, message: "Incorrect password." };
      this.setCurrentUser(found);
      return { success: true, user: found };
    }
  },

  async signup({ name, firstName, lastName, email, company, role, password }) {
    // keep legacy-friendly signature
    const fullName = name || `${firstName || ""} ${lastName || ""}`.trim();
    try {
      const users = await db.getAll("users");
      if (users.some((u) => (u.email || "").toLowerCase() === (email || "").toLowerCase().trim())) {
        return { success: false, message: "An account with this email already exists." };
      }
      const id = `usr-${Date.now()}-${Math.random()}`.replace(/\./g, "");
      const hash = await sha256Hex(password || Math.random().toString(36).slice(2,10));
      const u = {
        id,
        employeeNumber: `EMP-${String(users.length+1).padStart(3, "0")}`,
        firstName: firstName || (fullName.split(" ")[0] || ""),
        lastName: lastName || (fullName.split(" ").slice(1).join(" ") || ""),
        name: fullName || "User",
        email,
        company: company || "Independent",
        role: role || "Project Team Member",
        avatar: (fullName || "").split(" ").map(n => n[0] || "").join("").slice(0,2).toUpperCase(),
        passwordHash: hash,
        createdAt: new Date().toISOString(),
        isActive: true,
        failedAttempts: 0,
        lockedUntil: null,
        loginHistory: []
      };
      await db.put("users", u);
      // update localStorage compatibility
      const usersList = (await db.getAll("users")).map(u2 => ({ id: u2.id, name: u2.name, email: u2.email, company: u2.company, role: u2.role, avatar: u2.avatar }));
      localStorage.setItem("cmware_users", JSON.stringify(usersList));
      await this.setCurrentUser(u);
      await db.put("activity", { id: `act-${Date.now()}-${Math.random()}`, timestamp: new Date().toISOString(), userId: u.id, action: "signup", detail: "Account created" });
      return { success: true, user: u };
    } catch (err) {
      // fallback to legacy localStorage behavior
      const users = this.getUsers();
      if (users.some((x) => (x.email || "").toLowerCase() === (email || "").toLowerCase().trim())) return { success: false, message: "An account with this email already exists." };
      const initials = (fullName || "").split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) || "US";
      const newUser = { id: `usr-${Date.now()}`, name: fullName || "User", email, company: company || "General Contractor", role: role || "Project Team Member", avatar: initials, password: password || "password123" };
      const updated = [...users, newUser];
      localStorage.setItem("cmware_users", JSON.stringify(updated));
      this.setCurrentUser(newUser);
      return { success: true, user: newUser };
    }
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.user || "cmware_current_user");
    document.dispatchEvent(new CustomEvent("user-changed", { detail: null }));
  },

  _startInactivityWatcher() {
    let timer = null;
    const reset = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        this.logout();
        document.dispatchEvent(new CustomEvent("toast", { detail: "Logged out due to inactivity." }));
      }, INACTIVITY_TIMEOUT_MS);
    };
    ["click","keydown","mousemove","touchstart"].forEach(ev => window.addEventListener(ev, reset));
    reset();
  }
};
