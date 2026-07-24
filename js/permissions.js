import { db } from "./db.js";
import { STORAGE_KEYS } from "./constants.js";

const PERMS_KEY = "cmware_user_permissions";

export async function computeUserPermissions(userId) {
  // aggregate permissions from user's assigned roles (roleIds) or legacy role string
  try {
    const user = await db.get("users", userId);
    if (!user) {
      localStorage.removeItem(PERMS_KEY);
      return [];
    }
    // gather role ids
    let roleIds = user.roleIds || (user.roles && user.roles.map(r => r.id)) || [];
    // legacy single role string: find role by name
    if ((!roleIds || !roleIds.length) && user.role) {
      const roles = await db.getAll("roles");
      const match = roles.find(r => (r.name || "").toLowerCase() === (user.role || "").toLowerCase());
      if (match) roleIds = [match.id];
    }

    const perms = new Set();
    if (roleIds && roleIds.length) {
      for (const rid of roleIds) {
        const role = await db.get("roles", rid);
        if (role && Array.isArray(role.permissions)) role.permissions.forEach(p => perms.add(p));
      }
    }
    // store to localStorage for sync checks
    const list = Array.from(perms);
    localStorage.setItem(PERMS_KEY, JSON.stringify(list));
    return list;
  } catch (e) {
    console.warn("computeUserPermissions error", e);
    return [];
  }
}

export function getStoredPermissions() {
  try {
    const raw = localStorage.getItem(PERMS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function hasPermissionSync(code) {
  if (!code) return true; // permissive fallback
  const perms = getStoredPermissions();
  if (!perms || !perms.length) return true; // permissive fallback to avoid blocking UI unexpectedly
  return perms.includes(code);
}

export async function hasPermission(code) {
  if (!code) return true;
  const perms = getStoredPermissions();
  if (perms && perms.length) return perms.includes(code);
  // try to compute for current user
  try {
    const current = localStorage.getItem(STORAGE_KEYS.user);
    if (!current) return false;
    const usr = JSON.parse(current);
    const computed = await computeUserPermissions(usr.id);
    return computed.includes(code);
  } catch {
    return false;
  }
}
