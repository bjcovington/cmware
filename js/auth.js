import { db } from "./db.js";
import { STORAGE_KEYS } from "./constants.js";

async function sha256Hex(str) {
  const enc = new TextEncoder().encode(str || "");
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
const LOCKOUT_THRESHOLD = 6;
const LOCKOUT_MINUTES = 15;

const PROJECT_ROLES = [
    "Project Executive",
    "Senior Project Manager",
    "Project Manager",
    "Assistant Project Manager",
    "Project Engineer",
    "Field Engineer",
    "Superintendent",
    "Assistant Superintendent",
    "General Superintendent",
    "Lead Architect",
    "Project Architect",
    "Structural Engineer",
    "MEP Engineer",
    "Electrical Engineer",
    "Mechanical Engineer",
    "Civil Engineer",
    "Cost Estimator",
    "Scheduler",
    "Safety Manager",
    "Quality Manager",
    "BIM Manager",
    "Project Coordinator",
    "Document Controller",
    "Trade Foreman",
    "Trade Lead",
    "Subcontractor PM",
    "Owner Representative",
    "Inspector",
    "Commissioning Agent"
];

const PROJECT_ACCESS_LEVELS = [
    "Full Access",
    "Read/Write",
    "Read Only",
    "Financial Read Only",
    "Field Only",
    "Admin Only"
];

const PROJECT_TEAM_KEY = "cmware_project_teams";

function getStoredTeams() {
    return JSON.parse(localStorage.getItem(PROJECT_TEAM_KEY) || "{}");
}

function setStoredTeams(teams) {
    localStorage.setItem(PROJECT_TEAM_KEY, JSON.stringify(teams));
    document.dispatchEvent(new CustomEvent("project-team-changed", { detail: teams }));
}

function getInitials(firstName = "", lastName = "") {
    return `${(firstName || "").charAt(0) || "U"}${(lastName || "").charAt(0) || "S"}`.toUpperCase();
}

function generateJobNumber() {
    const existing = getStoredJobs();
    let maxNum = 0;
    for (const job of existing) {
        const num = parseInt(job.number?.replace(/\D/g, "") || "0", 10);
        if (num > maxNum) maxNum = num;
    }
    const next = String(maxNum + 1).padStart(6, "0");
    return next;
}

function getStoredJobs() {
    return JSON.parse(localStorage.getItem("cmware_jobs") || "[]");
}

function setStoredJobs(jobs) {
    localStorage.setItem("cmware_jobs", JSON.stringify(jobs));
    document.dispatchEvent(new CustomEvent("jobs-changed", { detail: jobs }));
}

function getStoredSubJobs() {
    return JSON.parse(localStorage.getItem("cmware_subjobs") || "[]");
}

function setStoredSubJobs(subJobs) {
    localStorage.setItem("cmware_subjobs", JSON.stringify(subJobs));
    document.dispatchEvent(new CustomEvent("subjobs-changed", { detail: subJobs }));
}

export const auth = {
  async init() {
    await db.migrateFromLocalStorage(STORAGE_KEYS);

    try {
      const users = await db.getAll("users");
      if (users && users.length) {
        localStorage.setItem("cmware_users", JSON.stringify(users.map(u => ({
          id: u.id,
          name: u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim(),
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          phoneNumber: u.phoneNumber,
          profilePicture: u.profilePicture,
          company: u.company,
          role: u.role,
          avatar: u.avatar || getInitials(u.firstName, u.lastName),
          password: undefined
        }))));

        if (!users.find(u => (u.role || "").toLowerCase().includes("admin"))) {
          const admin = {
            id: `usr-admin`,
            firstName: "System",
            lastName: "Administrator",
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
          const newUsers = await db.getAll("users");
          localStorage.setItem("cmware_users", JSON.stringify(newUsers.map(u => ({ id: u.id, name: u.name, firstName: u.firstName, lastName: u.lastName, email: u.email, phoneNumber: u.phoneNumber, profilePicture: u.profilePicture, company: u.company, role: u.role, avatar: u.avatar }))));
        }
      }
    } catch (e) {
      // ignore
    }

    if (!localStorage.getItem(STORAGE_KEYS.user)) {
      const existing = JSON.parse(localStorage.getItem("cmware_users") || "[]");
      if (existing && existing.length) {
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(existing[0]));
        document.dispatchEvent(new CustomEvent("user-changed", { detail: existing[0] }));
      }
    }

    this._startInactivityWatcher();
  },

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
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
      company: user.company,
      role: user.role,
      avatar: user.avatar || getInitials(user.firstName, user.lastName)
    };
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(safe));
    document.dispatchEvent(new CustomEvent("user-changed", { detail: safe }));
  },

  async updateCurrentUser(updates) {
    const current = this.getCurrentUser();
    if (!current) return { success: false, message: "No user logged in" };

    const merged = { ...current, ...updates };
    this.setCurrentUser(merged);

    try {
      const dbUsers = await db.getAll("users");
      const dbUser = dbUsers.find(u => u.id === current.id);
      if (dbUser) {
        const updated = { ...dbUser, ...updates };
        await db.put("users", updated);
        const usersList = (await db.getAll("users")).map(u => ({ id: u.id, name: u.name, firstName: u.firstName, lastName: u.lastName, email: u.email, phoneNumber: u.phoneNumber, profilePicture: u.profilePicture, company: u.company, role: u.role, avatar: u.avatar }));
        localStorage.setItem("cmware_users", JSON.stringify(usersList));
      }
    } catch (e) {
      // localStorage fallback handled above
    }
    return { success: true, user: merged };
  },

  async login(email, password) {
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

      found.failedAttempts = 0;
      found.lockedUntil = null;
      found.lastLogin = new Date().toISOString();
      found.loginHistory = (found.loginHistory || []).slice(-49).concat([{ at: found.lastLogin, ip: "local" }]);
      await db.put("users", found);

      const usersList = (await db.getAll("users")).map(u => ({ id: u.id, name: u.name, firstName: u.firstName, lastName: u.lastName, email: u.email, phoneNumber: u.phoneNumber, profilePicture: u.profilePicture, company: u.company, role: u.role, avatar: u.avatar }));
      localStorage.setItem("cmware_users", JSON.stringify(usersList));

      await this.setCurrentUser(found);

      await db.put("activity", { id: `act-${Date.now()}-${Math.random()}`, timestamp: new Date().toISOString(), userId: found.id, action: "login", detail: "User logged in" });
      return { success: true, user: found };
    } catch (err) {
      const users = this.getUsers();
      const found = users.find((u) => (u.email || "").toLowerCase() === (email || "").toLowerCase().trim());
      if (!found) return { success: false, message: "User not found. Check email or sign up." };
      if (found.password && found.password !== password) return { success: false, message: "Incorrect password." };
      this.setCurrentUser(found);
      return { success: true, user: found };
    }
  },

  async signup({ firstName, lastName, email, phoneNumber, company, role, password, profilePicture }) {
    const fullName = `${firstName || ""} ${lastName || ""}`.trim();
    try {
      const users = await db.getAll("users");
      if (users.some((u) => (u.email || "").toLowerCase() === (email || "").toLowerCase().trim())) {
        return { success: false, message: "An account with this email already exists." };
      }
      const id = `usr-${Date.now()}-${Math.random()}`.replace(/\./g, "");
      const hash = await sha256Hex(password || Math.random().toString(36).slice(2, 10));
      const u = {
        id,
        employeeNumber: `EMP-${String(users.length + 1).padStart(3, "0")}`,
        firstName: firstName || (fullName.split(" ")[0] || ""),
        lastName: lastName || (fullName.split(" ").slice(1).join(" ") || ""),
        name: fullName || "User",
        email,
        phoneNumber: phoneNumber || "",
        profilePicture: profilePicture || "",
        company: company || "Independent",
        role: role || "Project Team Member",
        avatar: getInitials(firstName, lastName),
        passwordHash: hash,
        createdAt: new Date().toISOString(),
        isActive: true,
        failedAttempts: 0,
        lockedUntil: null,
        loginHistory: []
      };
      await db.put("users", u);
      const usersList = (await db.getAll("users")).map(u2 => ({ id: u2.id, name: u2.name, firstName: u2.firstName, lastName: u2.lastName, email: u2.email, phoneNumber: u2.phoneNumber, profilePicture: u2.profilePicture, company: u2.company, role: u2.role, avatar: u2.avatar }));
      localStorage.setItem("cmware_users", JSON.stringify(usersList));
      await this.setCurrentUser(u);
      await db.put("activity", { id: `act-${Date.now()}-${Math.random()}`, timestamp: new Date().toISOString(), userId: u.id, action: "signup", detail: "Account created" });
      return { success: true, user: u };
    } catch (err) {
      const users = this.getUsers();
      if (users.some((x) => (x.email || "").toLowerCase() === (email || "").toLowerCase().trim())) return { success: false, message: "An account with this email already exists." };
      const initials = getInitials(firstName, lastName);
      const newUser = { id: `usr-${Date.now()}`, name: fullName || "User", firstName, lastName, email, phoneNumber: phoneNumber || "", profilePicture: profilePicture || "", company: company || "General Contractor", role: role || "Project Team Member", avatar: initials, password: password || "password123" };
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
    ["click", "keydown", "mousemove", "touchstart"].forEach(ev => window.addEventListener(ev, reset));
    reset();
  },

  getProjectRoles() {
    return PROJECT_ROLES;
  },

  getProjectAccessLevels() {
    return PROJECT_ACCESS_LEVELS;
  },

  getProjectTeam(projectId) {
    const teams = getStoredTeams();
    return teams[projectId] || [];
  },

  addProjectTeamMember(projectId, member) {
    const teams = getStoredTeams();
    if (!teams[projectId]) teams[projectId] = [];
    const newMember = {
      id: `ptm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      userId: member.userId,
      name: member.name,
      email: member.email,
      company: member.company,
      role: member.role,
      avatar: member.avatar,
      accessLevel: member.accessLevel || "Full Access",
      addedAt: new Date().toISOString().split("T")[0],
      addedBy: this.getCurrentUser()?.id || "system"
    };
    teams[projectId].push(newMember);
    setStoredTeams(teams);
    return newMember;
  },

  updateProjectTeamMember(projectId, memberId, updates) {
    const teams = getStoredTeams();
    if (!teams[projectId]) return null;
    const memberIndex = teams[projectId].findIndex(m => m.id === memberId);
    if (memberIndex === -1) return null;
    teams[projectId][memberIndex] = { ...teams[projectId][memberIndex], ...updates };
    setStoredTeams(teams);
    return teams[projectId][memberIndex];
  },

  removeProjectTeamMember(projectId, memberId) {
    const teams = getStoredTeams();
    if (!teams[projectId]) return false;
    teams[projectId] = teams[projectId].filter(m => m.id !== memberId);
    setStoredTeams(teams);
    return true;
  },

  getAvailableUsersForProject(projectId) {
    const currentTeam = this.getProjectTeam(projectId);
    const currentUserIds = new Set(currentTeam.map(m => m.userId));
    return this.getUsers().filter(u => !currentUserIds.has(u.id));
  },

  // Job management
  getJobs() {
    return getStoredJobs();
  },

  getJob(jobId) {
    const jobs = getStoredJobs();
    return jobs.find(j => j.id === jobId);
  },

  getJobByNumber(number) {
    const jobs = getStoredJobs();
    return jobs.find(j => j.number === number);
  },

  createJob(jobData) {
    const jobs = getStoredJobs();
    const number = jobData.number || generateJobNumber();
    const newJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      number,
      name: jobData.name,
      description: jobData.description || "",
      address: jobData.address || "",
      phase: jobData.phase || "Pre-Construction",
      value: Number(jobData.value || 0),
      squareFeet: Number(jobData.squareFeet || 0),
      startDate: jobData.startDate || new Date().toISOString().split("T")[0],
      completionDate: jobData.completionDate || "",
      owner: jobData.owner || "",
      architect: jobData.architect || "",
      generalContractor: jobData.generalContractor || "",
      createdBy: this.getCurrentUser()?.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSubJob: false,
      parentJobId: null
    };
    setStoredJobs([newJob, ...jobs]);
    return newJob;
  },

  updateJob(jobId, updates) {
    const jobs = getStoredJobs().map(j => {
      if (j.id === jobId) {
        return { ...j, ...updates, updatedAt: new Date().toISOString() };
      }
      return j;
    });
    setStoredJobs(jobs);
    return jobs.find(j => j.id === jobId);
  },

  deleteJob(jobId) {
    const jobs = getStoredJobs().filter(j => j.id !== jobId);
    setStoredJobs(jobs);
    // Also delete sub-jobs
    const subJobs = getStoredSubJobs().filter(sj => sj.parentJobId !== jobId);
    setStoredSubJobs(subJobs);
  },

  getSubJobs(parentJobId) {
    const subJobs = getStoredSubJobs();
    return subJobs.filter(sj => sj.parentJobId === parentJobId);
  },

  createSubJob(parentJobId, subJobData) {
    const subJobs = getStoredSubJobs();
    const parentJob = this.getJob(parentJobId);
    if (!parentJob) return null;

    const subNumber = `${parentJob.number}.${String(subJobs.filter(s => s.parentJobId === parentJobId).length + 1).padStart(2, "0")}`;
    const newSubJob = {
      id: `subjob-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      number: subNumber,
      name: subJobData.name,
      description: subJobData.description || "",
      address: subJobData.address || parentJob.address,
      phase: subJobData.phase || "Pre-Construction",
      value: Number(subJobData.value || 0),
      squareFeet: Number(subJobData.squareFeet || 0),
      startDate: subJobData.startDate || new Date().toISOString().split("T")[0],
      completionDate: subJobData.completionDate || "",
      owner: subJobData.owner || parentJob.owner,
      architect: subJobData.architect || parentJob.architect,
      generalContractor: subJobData.generalContractor || parentJob.generalContractor,
      createdBy: this.getCurrentUser()?.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSubJob: true,
      parentJobId
    };
    setStoredSubJobs([newSubJob, ...subJobs]);
    return newSubJob;
  },

  updateSubJob(subJobId, updates) {
    const subJobs = getStoredSubJobs().map(sj => {
      if (sj.id === subJobId) {
        return { ...sj, ...updates, updatedAt: new Date().toISOString() };
      }
      return sj;
    });
    setStoredSubJobs(subJobs);
    return subJobs.find(sj => sj.id === subJobId);
  },

  deleteSubJob(subJobId) {
    const subJobs = getStoredSubJobs().filter(sj => sj.id !== subJobId);
    setStoredSubJobs(subJobs);
  },

  getAllJobsForUser(userId) {
    const jobs = getStoredJobs();
    const subJobs = getStoredSubJobs();
    const allJobs = [...jobs, ...subJobs];
    return allJobs.filter(j => j.createdBy === userId || this.isUserOnJob(j.id, userId));
  },

  isUserOnJob(jobId, userId) {
    const team = this.getProjectTeam(jobId);
    return team.some(m => m.userId === userId);
  },

  joinJobByNumber(jobNumber, userId) {
    const job = this.getJobByNumber(jobNumber);
    if (!job) return { success: false, message: "Job not found" };

    const team = this.getProjectTeam(job.id);
    if (team.some(m => m.userId === userId)) {
      return { success: false, message: "Already a member of this job" };
    }

    const user = this.getUsers().find(u => u.id === userId);
    if (!user) return { success: false, message: "User not found" };

    this.addProjectTeamMember(job.id, {
      userId: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
      role: "Project Team Member",
      avatar: user.avatar,
      accessLevel: "Read/Write"
    });

    return { success: true, job };
  }
};