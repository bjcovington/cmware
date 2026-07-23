import { records as seedRecords } from "./database.js";
import { STORAGE_KEYS } from "./constants.js";

function readAll() {
    const stored = localStorage.getItem(STORAGE_KEYS.records);
    if (!stored) {
        localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(seedRecords));
        return [...seedRecords];
    }

    try {
        return JSON.parse(stored);
    } catch {
        localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(seedRecords));
        return [...seedRecords];
    }
}

function writeAll(records) {
    localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));
    document.dispatchEvent(new CustomEvent("records-changed"));
}

export const recordStore = {
    all() {
        return readAll();
    },

    byModule(moduleKey) {
        return readAll().filter((record) => record.module === moduleKey);
    },

    create(moduleKey, values, prefix) {
        const all = readAll();
        const moduleRecords = all.filter((record) => record.module === moduleKey);
        const nextNumber = `${prefix}-${String(moduleRecords.length + 1).padStart(4, "0")}`;
        const record = {
            id: `${moduleKey}-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
            module: moduleKey,
            number: values.number || nextNumber,
            title: values.title,
            status: values.status || "Open",
            ballInCourt: values.ballInCourt || "Project Manager",
            due: values.due || "Unscheduled",
            priority: values.priority || "Normal",
            cost: Number(values.cost || 0),
            description: values.description || "",
            createdAt: new Date().toISOString()
        };
        writeAll([record, ...all]);
        return record;
    },

    updateStatus(id, status) {
        const all = readAll().map((record) => record.id === id ? { ...record, status } : record);
        writeAll(all);
    },

    remove(id) {
        writeAll(readAll().filter((record) => record.id !== id));
    },

    search(query) {
        const term = query.trim().toLowerCase();
        if (!term) return readAll();
        return readAll().filter((record) => [
            record.number,
            record.title,
            record.status,
            record.ballInCourt,
            record.description
        ].some((value) => String(value || "").toLowerCase().includes(term)));
    }
};
