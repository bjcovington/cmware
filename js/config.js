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
import { DailyLogs } from "./pages/DailyLogs.js";
import { Drawings } from "./pages/Drawings.js";
import { Financials } from "./pages/Financials.js";
import { PunchList } from "./pages/PunchList.js";
import { Reports } from "./pages/Reports.js";
import { Search } from "./pages/Search.js";
import { Settings } from "./pages/Settings.js";

export const routes = [
    { path: "dashboard", title: "Dashboard", icon: "layout-dashboard", section: "Dashboard", page: new Dashboard() },
    { path: "project", title: "Project Overview", icon: "building-2", section: "Project", page: new Project() },
    { path: "drawings", title: "Drawings & Specs", icon: "file-image", section: "Project", page: new Drawings() },
    { path: "financials", title: "Budget & Commitments", icon: "dollar-sign", section: "Financials", page: new Financials() },
    { path: "rfis", title: "RFIs", icon: "message-square", section: "Documents", page: new RFIs() },
    { path: "submittals", title: "Submittals", icon: "clipboard-list", section: "Documents", page: new Submittals() },
    { path: "asis", title: "ASIs", icon: "file-pen-line", section: "Documents", page: new ASIs() },
    { path: "ccds", title: "CCDs", icon: "files", section: "Documents", page: new CCDs() },
    { path: "proposal-requests", title: "Proposal Requests", icon: "send", section: "Documents", page: new ProposalRequests() },
    { path: "notifications", title: "Change Notifications", icon: "bell-ring", section: "Documents", page: new Notifications() },
    { path: "change-events", title: "Change Events", icon: "triangle-alert", section: "Changes", page: new ChangeEvents() },
    { path: "change-orders", title: "Change Orders", icon: "badge-dollar-sign", section: "Changes", page: new ChangeOrders() },
    { path: "daily-logs", title: "Daily Field Logs", icon: "calendar", section: "Field Operations", page: new DailyLogs() },
    { path: "punch-list", title: "Punch List", icon: "check-square", section: "Field Operations", page: new PunchList() },
    { path: "logs", title: "Consolidated Logs", icon: "list-checks", section: "Logs", page: new Logs() },
    { path: "reports", title: "Executive Reports", icon: "bar-chart-3", section: "Reports", page: new Reports() },
    { path: "search", title: "Global Search", icon: "search", section: "Help", page: new Search() },
    { path: "settings", title: "Project Directory & Settings", icon: "settings", section: "Administration", page: new Settings() }
];
