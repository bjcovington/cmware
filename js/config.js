import { Dashboard } from "./pages/Dashboard.js";
import { Project } from "./pages/Project.js";
import { RFIs } from "./pages/RFIs.js";
import { Submittals } from "./pages/Submittals.js";
import { ChangeEvents } from "./pages/ChangeEvents.js";
import { ChangeOrders } from "./pages/ChangeOrders.js";
import { ASIs } from "./pages/ASIs.js";
import { CCDs } from "./pages/CCDs.js";
import { ProposalRequests } from "./pages/ProposalRequests.js";
import { Notifications } from "./pages/Notifications.js";
import { Logs } from "./pages/Logs.js";
import { Reports } from "./pages/Reports.js";
import { Search } from "./pages/Search.js";
import { Settings } from "./pages/Settings.js";

export const routes = [
    { path: "dashboard", title: "Dashboard", icon: "layout-dashboard", section: "Dashboard", page: new Dashboard() },
    { path: "project", title: "Project", icon: "building-2", section: "Project", page: new Project() },
    { path: "rfis", title: "RFIs", icon: "message-square", section: "Documents", page: new RFIs() },
    { path: "submittals", title: "Submittals", icon: "clipboard-list", section: "Documents", page: new Submittals() },
    { path: "asis", title: "ASIs", icon: "file-pen-line", section: "Documents", page: new ASIs() },
    { path: "ccds", title: "CCDs", icon: "files", section: "Documents", page: new CCDs() },
    { path: "proposal-requests", title: "Proposal Requests", icon: "send", section: "Documents", page: new ProposalRequests() },
    { path: "notifications", title: "Change Notifications", icon: "bell-ring", section: "Documents", page: new Notifications() },
    { path: "change-events", title: "Change Events", icon: "triangle-alert", section: "Changes", page: new ChangeEvents() },
    { path: "change-orders", title: "Change Orders", icon: "badge-dollar-sign", section: "Changes", page: new ChangeOrders() },
    { path: "logs", title: "Logs", icon: "list-checks", section: "Logs", page: new Logs() },
    { path: "reports", title: "Reports", icon: "bar-chart-3", section: "Reports", page: new Reports() },
    { path: "search", title: "Search", icon: "search", section: "Help", page: new Search() },
    { path: "settings", title: "Project Settings", icon: "settings", section: "Administration", page: new Settings() }
];
