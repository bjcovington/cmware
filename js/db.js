// Minimal IndexedDB helper for the client PWA
const DB_NAME = "cmware_db";
const DB_VERSION = 1;
const STORES = [
  "users","roles","permissions","companies","contacts",
  "projects","assignments","records","settings","activity",
  "notifications","attachments"
];

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      STORES.forEach((s) => {
        if (!db.objectStoreNames.contains(s)) {
          db.createObjectStore(s, { keyPath: "id" });
        }
      });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const db = {
  async get(storeName, id) {
    const dbu = await openDB();
    return new Promise((resolve, reject) => {
      const tx = dbu.transaction(storeName, "readonly");
      const req = tx.objectStore(storeName).get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async getAll(storeName) {
    const dbu = await openDB();
    return new Promise((resolve, reject) => {
      const tx = dbu.transaction(storeName, "readonly");
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async put(storeName, value) {
    const dbu = await openDB();
    return new Promise((resolve, reject) => {
      const tx = dbu.transaction(storeName, "readwrite");
      const req = tx.objectStore(storeName).put(value);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async delete(storeName, id) {
    const dbu = await openDB();
    return new Promise((resolve, reject) => {
      const tx = dbu.transaction(storeName, "readwrite");
      const req = tx.objectStore(storeName).delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  },

  async clear(storeName) {
    const dbu = await openDB();
    return new Promise((resolve, reject) => {
      const tx = dbu.transaction(storeName, "readwrite");
      const req = tx.objectStore(storeName).clear();
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  },

  // Migration: import existing localStorage items (seed) into IndexedDB
  async migrateFromLocalStorage(STORAGE_KEYS, seedDataProvider = null) {
    // seedDataProvider is optional object with getters: records, contacts, projects, users, settings...
    // Only run if users store is empty
    try {
      const existing = await this.getAll("users");
      if (existing && existing.length) return; // already migrated
    } catch (e) {
      // ignore
    }

    try {
      if (seedDataProvider) {
        const seedUsers = seedDataProvider.getUsers?.() || seedDataProvider.users?.() || [];
        for (const u of seedUsers) {
          await this.put("users", { id: u.id || `usr-${Date.now()}-${Math.random()}`, ...u });
        }
        const seedRecords = seedDataProvider.all?.() || seedDataProvider.records?.() || [];
        for (const r of seedRecords) {
          const rec = { id: r.id || `${r.module}-${Date.now()}-${Math.random()}`, ...r };
          await this.put("records", rec);
        }
        const seedContacts = seedDataProvider.getContacts?.() || seedDataProvider.contacts?.() || [];
        for (const c of seedContacts) await this.put("contacts", { id: c.id || `cnt-${Date.now()}-${Math.random()}`, ...c });
        const seedProjects = seedDataProvider.getProjectInfo?.() ? [seedDataProvider.getProjectInfo()] : (seedDataProvider.projects?.() || []);
        for (const p of seedProjects) await this.put("projects", { id: p.id || `prj-${Date.now()}-${Math.random()}`, ...p });
        const settings = seedDataProvider.getSettings?.() || seedDataProvider.settings?.() || {};
        await this.put("settings", { id: "settings", ...settings });

        // roles if provided
        const seedRoles = seedDataProvider.getRoles?.() || seedDataProvider.roles?.() || [];
        for (const r of seedRoles) await this.put("roles", { id: r.id || `role-${Date.now()}-${Math.random()}`, ...r });

      } else {
        // fallback: try to import keys by STORAGE_KEYS mapping
        try {
          const records = JSON.parse(localStorage.getItem(STORAGE_KEYS.records) || "[]");
          for (const r of records) await this.put("records", { id: r.id || `${r.module}-${Date.now()}`, ...r });
          const contacts = JSON.parse(localStorage.getItem(STORAGE_KEYS.directory) || "[]");
          for (const c of contacts) await this.put("contacts", { id: c.id || `cnt-${Date.now()}`, ...c });
          const settings = JSON.parse(localStorage.getItem("cmware_settings") || "{}");
          await this.put("settings", { id: "settings", ...settings });
          const usersRaw = JSON.parse(localStorage.getItem("cmware_users") || "[]");
          for (const u of usersRaw) await this.put("users", { id: u.id || `usr-${Date.now()}`, ...u });
          const rolesRaw = JSON.parse(localStorage.getItem(STORAGE_KEYS.roles) || "[]");
          for (const r of rolesRaw) await this.put("roles", { id: r.id || `role-${Date.now()}`, ...r });
        } catch (e) {
          // ignore parse errors
        }
      }
    } catch (err) {
      console.warn("Migration error:", err);
    }
  }
};
