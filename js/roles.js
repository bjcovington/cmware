import { db } from "./db.js";

export const Roles = {
  async list() { return await db.getAll("roles"); },

  async get(id) { return await db.get("roles", id); },

  async create({ name, description = "", permissions = [] }) {
    const id = `role-${Date.now()}-${Math.random()}`.replace(/\./g, "");
    const item = { id, name, description, permissions };
    await db.put("roles", item);
    return item;
  },

  async update(id, updates) {
    const r = await this.get(id);
    if (!r) throw new Error("Role not found");
    const merged = { ...r, ...updates };
    await db.put("roles", merged);
    return merged;
  },

  async remove(id) { await db.delete("roles", id); },

  async setPermissions(id, permissions = []) {
    return await this.update(id, { permissions });
  },

  async listPermissions() {
    const perms = await db.getAll("permissions");
    if (perms && perms.length) return perms;
    const defaultPerms = [
      { id: "perm-create-rfi", code: "create:rfi", description: "Can create RFIs" },
      { id: "perm-edit-rfi", code: "edit:rfi", description: "Can edit RFIs" },
      { id: "perm-delete-rfi", code: "delete:rfi", description: "Can delete RFIs" },
      { id: "perm-manage-users", code: "manage:users", description: "Can manage users" },
      { id: "perm-view-financials", code: "view:financials", description: "Can view financial information" },
      { id: "perm-generate-pdf", code: "generate:pdf", description: "Can generate PDFs" }
    ];
    for (const p of defaultPerms) await db.put("permissions", p);
    return defaultPerms;
  }
};
