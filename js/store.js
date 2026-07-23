import { STORAGE_KEYS } from "./constants.js";

const initialState = {
    sidebarCollapsed: localStorage.getItem(STORAGE_KEYS.sidebar) === "true",
    theme: localStorage.getItem(STORAGE_KEYS.theme) || "light",
    selectedProjectId: localStorage.getItem(STORAGE_KEYS.project) || "RIV-104"
};

class Store {
    constructor(state) {
        this.state = state;
        this.listeners = new Set();
    }

    getState() {
        return { ...this.state };
    }

    setState(partial) {
        this.state = { ...this.state, ...partial };
        this.listeners.forEach((listener) => listener(this.getState()));
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
}

export const store = new Store(initialState);
