import {
    records as seedRecords,
    contacts as seedContacts,
    projects as seedProjects,
    dailyLogs as seedDailyLogs,
    drawings as seedDrawings,
    budget as seedBudget,
    punchList as seedPunchList
} from "./database.js";
import { STORAGE_KEYS } from "./constants.js";

const SUBCONTRACTS_KEY = "cmware_subcontracts";
const SETTINGS_KEY = "cmware_settings";

const DEFAULT_SETTINGS = {
    rfiPrefix: "RFI",
    submittalPrefix: "SUB",
    changeOrderPrefix: "CO",
    changeEventPrefix: "CE",
    currency: "USD",
    defaultBallInCourt: "Project Manager",
    companyName: "Apex Construction"
};

const SEED_SUBCONTRACTS = [
    {
        id: "sc-001",
        scode: "SC-0330",
        company: "Hardrock Concrete LLC",
        trade: "Concrete & Reinforcing Steel",
        costCode: "03 30 00",
        scope: "All cast-in-place concrete, rebar placement, and shoring for Levels 01–04.",
        value: 8200000,
        status: "Executed",
        executedDate: "2025-10-01",
        contact: "Mike O'Brien"
    },
    {
        id: "sc-002",
        scode: "SC-2600",
        company: "Volt Electric Inc.",
        trade: "Electrical Distribution & Lighting",
        costCode: "26 00 00",
        scope: "All electrical power, lighting, emergency systems, and gear.",
        value: 6750000,
        status: "Executed",
        executedDate: "2025-10-15",
        contact: "Carlos Rodriguez"
    },
    {
        id: "sc-003",
        scode: "SC-0742",
        company: "Exterior Concepts LLC",
        trade: "Insulated Metal Panels & Glazing",
        costCode: "07 42 13",
        scope: "Supply and install Centria Formawall IMP system and storefront glazing.",
        value: 4150000,
        status: "Executed",
        executedDate: "2025-11-01",
        contact: "Dana Walsh"
    }
];

function getStored(key, seedData) {
    const stored = localStorage.getItem(key);
    if (!stored) {
        localStorage.setItem(key, JSON.stringify(seedData));
        return Array.isArray(seedData) ? [...seedData] : { ...seedData };
    }
    try {
        return JSON.parse(stored);
    } catch {
        localStorage.setItem(key, JSON.stringify(seedData));
        return Array.isArray(seedData) ? [...seedData] : { ...seedData };
    }
}

function setStored(key, data, eventName = "records-changed") {
    localStorage.setItem(key, JSON.stringify(data));
    document.dispatchEvent(new CustomEvent(eventName));
}

export const recordStore = {
    // ── General Records ────────────────────────────────────────────────────
    all() { return getStored(STORAGE_KEYS.records, seedRecords); },

    byModule(moduleKey) { return this.all().filter((r) => r.module === moduleKey); },

    filterByTab(moduleKey, tabName) {
        const rows = this.byModule(moduleKey);
        if (!tabName || tabName === "All Items") return rows;

        if (tabName === "My Ball In Court") {
            const cu = localStorage.getItem(STORAGE_KEYS.user);
            const userName = cu ? JSON.parse(cu).name : "";
            return rows.filter((r) =>
                (r.ballInCourt || "").includes(userName) ||
                (r.assignedTo || "").includes(userName)
            );
        }
        if (tabName === "Overdue") {
            const today = new Date().toISOString().split("T")[0];
            return rows.filter((r) =>
                r.due && r.due !== "Complete" && r.due !== "Unscheduled" &&
                r.due < today && r.status !== "Closed" && r.status !== "Approved"
            );
        }
        if (tabName === "Drafts") return rows.filter((r) => r.status === "Draft");
        if (tabName === "Closed") return rows.filter((r) => r.status === "Closed" || r.status === "Approved" || r.status === "No Exceptions");
        return rows;
    },

    create(moduleKey, values, prefix) {
        const all = this.all();
        const moduleRecs = all.filter((r) => r.module === moduleKey);
        const settings = this.getSettings();
        const resolvedPrefix = {
            rfis: settings.rfiPrefix || prefix,
            submittals: settings.submittalPrefix || prefix,
            "change-orders": settings.changeOrderPrefix || prefix,
            "change-events": settings.changeEventPrefix || prefix
        }[moduleKey] || prefix;

        const num = values.number || `${resolvedPrefix}-${String(moduleRecs.length + 1).padStart(4, "0")}`;
        const record = {
            id: `${moduleKey}-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
            module: moduleKey,
            number: num,
            title: values.title || "Untitled",
            type: values.type || "",
            status: values.status || "Open",
            ballInCourt: values.ballInCourt || values.assignedTo || settings.defaultBallInCourt || "Project Manager",
            assignedTo: values.assignedTo || values.ballInCourt || "",
            assignedCompany: values.assignedCompany || "",
            due: values.due || "Unscheduled",
            priority: values.priority || "Normal",
            specSection: values.specSection || "",
            drawingNumber: values.drawingNumber || "",
            costImpact: values.costImpact || "$0",
            scheduleImpact: values.scheduleImpact || "0 Days",
            cost: Number((values.costImpact || "0").replace(/[^0-9.]/g, "") || values.cost || 0),
            question: values.question || values.description || "",
            suggestion: values.suggestion || "",
            description: values.description || values.question || "",
            officialAnswer: values.officialAnswer || "",
            reason: values.reason || "",
            subcontractor: values.subcontractor || "",
            manufacturer: values.manufacturer || "",
            leadTime: values.leadTime || "",
            attachments: [],
            createdAt: new Date().toISOString().split("T")[0]
        };
        setStored(STORAGE_KEYS.records, [record, ...all]);
        return record;
    },

    updateRecord(id, fields) {
        // Recalculate revised budget if costImpact changed
        if (fields.costImpact) {
            fields.cost = Number(String(fields.costImpact).replace(/[^0-9.]/g, "") || 0);
        }
        const all = this.all().map((r) =>
            r.id === id ? { ...r, ...fields, updatedAt: new Date().toISOString() } : r
        );
        setStored(STORAGE_KEYS.records, all);
    },

    addResponse(id, { officialAnswer, nextStatus, answeredBy }) {
        const all = this.all().map((r) => {
            if (r.id !== id) return r;
            const history = [...(r.responseHistory || []), {
                author: answeredBy || "Reviewer",
                date: new Date().toLocaleString(),
                answer: officialAnswer
            }];
            return { ...r, officialAnswer, status: nextStatus || r.status, responseHistory: history };
        });
        setStored(STORAGE_KEYS.records, all);
    },

    updateStatus(id, status) {
        setStored(STORAGE_KEYS.records, this.all().map((r) => r.id === id ? { ...r, status } : r));
    },

    remove(id) { setStored(STORAGE_KEYS.records, this.all().filter((r) => r.id !== id)); },

    search(query) {
        const term = String(query || "").trim().toLowerCase();
        if (!term) return this.all();
        return this.all().filter((r) =>
            [r.number, r.title, r.status, r.ballInCourt, r.assignedTo,
             r.specSection, r.question, r.description, r.officialAnswer]
            .some((v) => String(v || "").toLowerCase().includes(term))
        );
    },

    // ── Directory ──────────────────────────────────────────────────────────
    getContacts() { return getStored(STORAGE_KEYS.directory, seedContacts); },

    addContact(contact) {
        const all = this.getContacts();
        const newC = {
            id: `cnt-${Date.now()}`,
            name: contact.name, email: contact.email,
            phone: contact.phone || "(312) 555-0100",
            company: contact.company || "General Contractor",
            role: contact.role || "Team Member",
            discipline: contact.discipline || "General",
            avatar: contact.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        };
        setStored(STORAGE_KEYS.directory, [newC, ...all], "directory-changed");
        return newC;
    },

    // ── Project Info ───────────────────────────────────────────────────────
    getProjectInfo() {
        const stored = localStorage.getItem(STORAGE_KEYS.projectInfo);
        if (stored) { try { return JSON.parse(stored); } catch {} }
        return seedProjects[0];
    },

    updateProjectInfo(info) {
        localStorage.setItem(STORAGE_KEYS.projectInfo, JSON.stringify(info));
        document.dispatchEvent(new CustomEvent("project-info-changed", { detail: info }));
    },

    // ── Settings ───────────────────────────────────────────────────────────
    getSettings() { return getStored(SETTINGS_KEY, DEFAULT_SETTINGS); },

    updateSettings(updates) {
        const current = this.getSettings();
        const merged = { ...current, ...updates };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
        document.dispatchEvent(new CustomEvent("toast", { detail: "Settings saved." }));
        return merged;
    },

    // ── Daily Logs ─────────────────────────────────────────────────────────
    getDailyLogs() { return getStored(STORAGE_KEYS.dailyLogs, seedDailyLogs); },

    addDailyLog(log) {
        const newLog = {
            id: `log-${Date.now()}`,
            date: log.date || new Date().toISOString().split("T")[0],
            author: log.author || "Project Manager",
            weather: log.weather || "75°F Clear",
            wind: log.wind || "5 mph",
            siteConditions: log.siteConditions || "Good conditions.",
            headcountTotal: Number(log.headcountTotal || 0),
            trades: log.trades || [],
            notes: log.notes || "",
            safety: log.safety || "No incidents reported.",
            deliveries: log.deliveries || "None"
        };
        setStored(STORAGE_KEYS.dailyLogs, [newLog, ...this.getDailyLogs()], "dailylogs-changed");
        return newLog;
    },

    // ── Drawings ───────────────────────────────────────────────────────────
    getDrawings() { return getStored(STORAGE_KEYS.drawings, seedDrawings); },

    addDrawing(dwg) {
        const newD = {
            id: `dwg-${Date.now()}`,
            sheetNumber: dwg.sheetNumber, title: dwg.title,
            discipline: dwg.discipline || "Architectural",
            rev: dwg.rev || "Rev 0",
            issueDate: dwg.issueDate || new Date().toISOString().split("T")[0],
            status: "Current",
            description: dwg.description || ""
        };
        setStored(STORAGE_KEYS.drawings, [newD, ...this.getDrawings()], "drawings-changed");
        return newD;
    },

    // ── Budget / Cost Codes ────────────────────────────────────────────────
    getBudget() { return getStored(STORAGE_KEYS.budget, seedBudget); },

    addBudgetLine(vals) {
        const all = this.getBudget();
        const orig = Number(vals.originalBudget || 0);
        const commit = Number(vals.commitments || 0);
        const newLine = {
            costCode: vals.costCode,
            description: vals.description,
            originalBudget: orig,
            approvedChanges: 0,
            revisedBudget: orig,
            commitments: commit,
            pendingExposure: 0,
            remainingBalance: orig - commit
        };
        setStored(STORAGE_KEYS.budget, [...all, newLine], "budget-changed");
    },

    updateBudgetLine(costCode, vals) {
        const all = this.getBudget().map((b) => {
            if (b.costCode !== costCode) return b;
            const orig = Number(vals.originalBudget || b.originalBudget);
            const approved = Number(vals.approvedChanges ?? b.approvedChanges);
            const commit = Number(vals.commitments || b.commitments);
            const pending = Number(vals.pendingExposure || b.pendingExposure);
            const revised = orig + approved;
            return {
                ...b,
                ...vals,
                originalBudget: orig,
                approvedChanges: approved,
                revisedBudget: revised,
                commitments: commit,
                pendingExposure: pending,
                remainingBalance: revised - commit - pending
            };
        });
        setStored(STORAGE_KEYS.budget, all, "budget-changed");
    },

    // ── Subcontracts ───────────────────────────────────────────────────────
    getSubcontracts() { return getStored(SUBCONTRACTS_KEY, SEED_SUBCONTRACTS); },

    addSubcontract(vals) {
        const all = this.getSubcontracts();
        const newSC = {
            id: `sc-${Date.now()}`,
            scode: vals.scode,
            company: vals.company,
            trade: vals.trade,
            costCode: vals.costCode || "",
            scope: vals.scope || "",
            value: Number(vals.value || 0),
            status: vals.status || "Pending",
            executedDate: vals.executedDate || "",
            contact: vals.contact || ""
        };
        setStored(SUBCONTRACTS_KEY, [newSC, ...all], "subcontracts-changed");
        return newSC;
    },

    updateSubcontract(id, vals) {
        const all = this.getSubcontracts().map((sc) =>
            sc.id === id ? { ...sc, ...vals, value: Number(vals.value || sc.value) } : sc
        );
        setStored(SUBCONTRACTS_KEY, all, "subcontracts-changed");
    },

    // ── Punch List ─────────────────────────────────────────────────────────
    getPunchList() { return getStored(STORAGE_KEYS.punchList, seedPunchList); },

    addPunchItem(item) {
        const all = this.getPunchList();
        const newItem = {
            id: `pnch-${Date.now()}`,
            number: `PNC-${String(all.length + 1).padStart(3, "0")}`,
            title: item.title,
            location: item.location || "General Site",
            assignedTrade: item.assignedTrade || "GC",
            assignedPerson: item.assignedPerson || "Unassigned",
            status: "Open",
            priority: item.priority || "Normal",
            dueDate: item.dueDate || new Date().toISOString().split("T")[0],
            description: item.description || ""
        };
        setStored(STORAGE_KEYS.punchList, [newItem, ...all], "punchlist-changed");
        return newItem;
    }
};
