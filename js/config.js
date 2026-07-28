import { Dashboard } from "./pages/Dashboard.js";
import { Project } from "./pages/Project.js";
import { RFIs } from "./pages/RFIs.js";
import { Submittals } from "./pages/Submittals.js";
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
import { Login } from "./pages/Login.js";
import { Signup } from "./pages/Signup.js";
import { CreateProject } from "./pages/CreateProject.js";
import { ProjectMembers } from "./pages/ProjectMembers.js";
import { Profile } from "./pages/Profile.js";
import { JoinProject } from "./pages/JoinProject.js";

// Financial Module - Phase 1: Foundation
import { CostCodes } from "./pages/financials/CostCodes.js";
import { Budget } from "./pages/financials/Budget.js";
import { Contracts } from "./pages/financials/Contracts.js";
import { FinancialDashboard } from "./pages/financials/FinancialDashboard.js";

// Financial Module - Phase 2: Procurement
import { Buyout } from "./pages/financials/Buyout.js";
import { PurchaseOrders } from "./pages/financials/PurchaseOrders.js";
import { Commitments } from "./pages/financials/Commitments.js";
import { Subcontracts } from "./pages/financials/Subcontracts.js";

// Financial Module - Phase 3: Change Management
import { ChangeEvents } from "./pages/financials/ChangeEvents.js";
import { PotentialChangeOrders } from "./pages/financials/PotentialChangeOrders.js";
import { OwnerChangeOrders } from "./pages/financials/OwnerChangeOrders.js";
import { SubcontractChangeOrders } from "./pages/financials/SubcontractChangeOrders.js";

// Financial Module - Phase 4: Accounting
import { Invoices } from "./pages/financials/Invoices.js";
import { PayApplications } from "./pages/financials/PayApplications.js";
import { PaymentTracking } from "./pages/financials/PaymentTracking.js";
import { Retention } from "./pages/financials/Retention.js";

// Financial Module - Phase 5: Executive Controls
import { Forecasting } from "./pages/financials/Forecasting.js";
import { CashFlow } from "./pages/financials/CashFlow.js";
import { FinancialReports } from "./pages/financials/FinancialReports.js";
import { AuditHistory } from "./pages/financials/AuditHistory.js";
import { ExecutiveDashboard } from "./pages/financials/ExecutiveDashboard.js";

export const routes = [
    { path: "login", title: "Sign In", icon: "log-in", section: "Auth", page: new Login(), public: true },
    { path: "signup", title: "Create Account", icon: "user-plus", section: "Auth", page: new Signup(), public: true },
    { path: "dashboard", title: "Dashboard", icon: "layout-dashboard", section: "Dashboard", page: new Dashboard() },
    { path: "project", title: "Project Overview", icon: "building-2", section: "Project", page: new Project() },
    { path: "create-project", title: "Create Project", icon: "plus-circle", section: "Administration", page: new CreateProject() },
    { path: "join-project", title: "Join Project", icon: "log-in", section: "Projects", page: new JoinProject() },
    { path: "project-members", title: "Project Team", icon: "users", section: "Administration", page: new ProjectMembers() },
    { path: "profile", title: "My Profile", icon: "user", section: "Account", page: new Profile() },
    { path: "drawings", title: "Drawings & Specs", icon: "file-image", section: "Project", page: new Drawings() },

    // Financial Module - Phase 1: Foundation
    { path: "financials", title: "Financial Dashboard", icon: "dollar-sign", section: "Financials", page: new FinancialDashboard() },
    { path: "cost-codes", title: "Cost Codes (CSI)", icon: "hash", section: "Financials", page: new CostCodes() },
    { path: "budget", title: "Project Budget", icon: "calculator", section: "Financials", page: new Budget() },
    { path: "contracts", title: "Contract Values", icon: "file-contract", section: "Financials", page: new Contracts() },

    // Financial Module - Phase 2: Procurement
    { path: "buyout", title: "Buyout & Procurement", icon: "shopping-cart", section: "Financials", page: new Buyout() },
    { path: "purchase-orders", title: "Purchase Orders", icon: "clipboard-list", section: "Financials", page: new PurchaseOrders() },
    { path: "commitments", title: "Commitments", icon: "handshake", section: "Financials", page: new Commitments() },
    { path: "subcontracts", title: "Subcontracts (S-Codes)", icon: "file-text", section: "Financials", page: new Subcontracts() },

    // Financial Module - Phase 3: Change Management
    { path: "change-events", title: "Change Events", icon: "triangle-alert", section: "Changes", page: new ChangeEvents() },
    { path: "pcos", title: "Potential Change Orders", icon: "badge-dollar-sign", section: "Changes", page: new PotentialChangeOrders() },
    { path: "owner-change-orders", title: "Owner Change Orders", icon: "pen-tool", section: "Changes", page: new OwnerChangeOrders() },
    { path: "subcontract-change-orders", title: "Subcontract Change Orders", icon: "file-pen", section: "Changes", page: new SubcontractChangeOrders() },

    // Financial Module - Phase 4: Accounting
    { path: "invoices", title: "Invoice Management", icon: "receipt", section: "Financials", page: new Invoices() },
    { path: "pay-applications", title: "Pay Applications", icon: "credit-card", section: "Financials", page: new PayApplications() },
    { path: "payments", title: "Payment Tracking", icon: "dollar-sign", section: "Financials", page: new PaymentTracking() },
    { path: "retention", title: "Retention Management", icon: "lock", section: "Financials", page: new Retention() },

    // Financial Module - Phase 5: Executive Controls
    { path: "forecasting", title: "Forecasting", icon: "trending-up", section: "Financials", page: new Forecasting() },
    { path: "cash-flow", title: "Cash Flow", icon: "bar-chart-2", section: "Financials", page: new CashFlow() },
    { path: "financial-reports", title: "Financial Reports", icon: "file-bar-chart", section: "Reports", page: new FinancialReports() },
    { path: "audit-history", title: "Audit History", icon: "clipboard-check", section: "Reports", page: new AuditHistory() },
    { path: "executive-dashboard", title: "Executive Dashboard", icon: "layout-dashboard", section: "Reports", page: new ExecutiveDashboard() },

    { path: "rfis", title: "RFIs", icon: "message-square", section: "Documents", page: new RFIs() },
    { path: "submittals", title: "Submittals", icon: "clipboard-list", section: "Documents", page: new Submittals() },
    { path: "asis", title: "ASIs", icon: "file-pen-line", section: "Documents", page: new ASIs() },
    { path: "ccds", title: "CCDs", icon: "files", section: "Documents", page: new CCDs() },
    { path: "proposal-requests", title: "Proposal Requests", icon: "send", section: "Documents", page: new ProposalRequests() },
    { path: "notifications", title: "Change Notifications", icon: "bell-ring", section: "Documents", page: new Notifications() },
    { path: "daily-logs", title: "Daily Field Logs", icon: "calendar", section: "Field Operations", page: new DailyLogs() },
    { path: "punch-list", title: "Punch List", icon: "check-square", section: "Field Operations", page: new PunchList() },
    { path: "logs", title: "Consolidated Logs", icon: "list-checks", section: "Logs", page: new Logs() },
    { path: "reports", title: "Executive Reports", icon: "bar-chart-3", section: "Reports", page: new Reports() },
    { path: "search", title: "Global Search", icon: "search", section: "Help", page: new Search() },
    { path: "settings", title: "Project Directory & Settings", icon: "settings", section: "Administration", page: new Settings() }
];

export const publicRoutes = ["login", "signup"];
