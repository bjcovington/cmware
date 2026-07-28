export const APP_NAME = "cmware";

export const STORAGE_KEYS = {
    sidebar: "cm.sidebarCollapsed",
    theme: "cm.theme",
    project: "cm.selectedProject",
    records: "cmware.records",
    user: "cmware_current_user",
    projectInfo: "cmware_project_info",
    directory: "cmware_directory",
    dailyLogs: "cmware_daily_logs",
    drawings: "cmware_drawings",
    budget: "cmware_budget",
    punchList: "cmware_punch_list",
    roles: "cmware_roles",
    costCodes: "cmware_cost_codes",
    scheduleOfValues: "cmware_sov",
    estimates: "cmware_estimates",
    buyout: "cmware_buyout",
    purchaseOrders: "cmware_purchase_orders",
    commitments: "cmware_commitments",
    subcontracts: "cmware_subcontracts",
    changeEvents: "cmware_change_events",
    pcos: "cmware_pcos",
    ownerChangeOrders: "cmware_owner_cos",
    subChangeOrders: "cmware_sub_cos",
    invoices: "cmware_invoices",
    payApps: "cmware_pay_apps",
    payments: "cmware_payments",
    cashFlow: "cmware_cash_flow",
    forecast: "cmware_forecast",
    retention: "cmware_retention",
    budgetTransfers: "cmware_budget_transfers",
    auditTrail: "cmware_audit_trail",
    projects: "cmware_projects",
    projectMembers: "cmware_project_members"
};

export const STATUS_BADGES = {
    Open: "warning",
    "In Review": "info",
    Pricing: "danger",
    Approved: "success",
    Issued: "neutral",
    Closed: "success",
    Draft: "neutral",
    Submitted: "info",
    "Revise and Resubmit": "danger",
    "No Exceptions": "success",
    "Approved as Noted": "info",
    "Pending": "warning",
    "Failed": "danger",
    "Passed": "success",
    Executed: "success",
    Voided: "danger",
    "Pending Execution": "warning",
    Received: "info",
    "PM Review": "info",
    "Accounting Review": "warning",
    "Payment Scheduled": "neutral",
    Paid: "success",
    Archived: "neutral"
};

export const COST_TYPES = [
    "Labor",
    "Material",
    "Equipment",
    "Subcontract",
    "General Conditions",
    "Contingency",
    "Allowances",
    "Other"
];

export const COST_CODE_STATUSES = ["Active", "Inactive"];

export const TAX_CATEGORIES = [
    "Taxable",
    "Non-Taxable",
    "Exempt",
    "Capital Equipment"
];

export const BUDGET_CATEGORIES = [
    "Hard Costs",
    "Soft Costs",
    "Contingency",
    "Allowances",
    "FF&E",
    "Other"
];

export const PO_STATUSES = [
    "Draft",
    "Pending Approval",
    "Approved",
    "Sent to Vendor",
    "Partial Receipt",
    "Fully Received",
    "Closed",
    "Cancelled"
];

export const COMMITMENT_SOURCES = [
    "Purchase Order",
    "Subcontract",
    "Rental Agreement",
    "Service Agreement",
    "Material Order"
];

export const INVOICE_STATUSES = [
    "Received",
    "PM Review",
    "Accounting Review",
    "Approved",
    "Payment Scheduled",
    "Paid",
    "Archived",
    "Rejected",
    "Disputed"
];

export const PAY_APP_STATUSES = [
    "Draft",
    "Submitted",
    "Under Review",
    "Approved",
    "Paid",
    "Rejected"
];

export const PAYMENT_METHODS = [
    "Check",
    "ACH",
    "Wire",
    "Credit Card",
    "Other"
];

export const PAYMENT_STATUSES = [
    "Pending",
    "Processing",
    "Cleared",
    "Failed",
    "Void"
];

export const CHANGE_EVENT_STATUSES = [
    "Open",
    "Under Review",
    "Pricing",
    "Submitted for Approval",
    "Approved",
    "Rejected",
    "Converted to PCO"
];

export const PCO_STATUSES = [
    "Draft",
    "Pending Review",
    "Submitted to Owner",
    "Under Negotiation",
    "Approved",
    "Rejected",
    "Converted to CO"
];

export const CO_STATUSES = [
    "Draft",
    "Pending Owner",
    "Pending Subcontractor",
    "Executed",
    "Voided"
];

export const FORECAST_CATEGORIES = [
    "Final Cost",
    "Final Revenue",
    "Final Profit",
    "Remaining Cost",
    "Remaining Labor",
    "Remaining Material",
    "Remaining Equipment",
    "Remaining Commitments",
    "Remaining Billing"
];

export const ROLES = [
    "Project Owner",
    "Project Executive",
    "Senior Project Manager",
    "Project Manager",
    "Assistant Project Manager",
    "Project Engineer",
    "Field Engineer",
    "Superintendent",
    "Assistant Superintendent",
    "Foreman",
    "Estimator",
    "Scheduler",
    "Safety Manager",
    "Quality Manager",
    "BIM/VDC Manager",
    "Preconstruction Manager",
    "Contracts Administrator",
    "Cost Engineer",
    "Accountant",
    "Subcontractor PM",
    "Subcontractor Superintendent",
    "Architect",
    "Engineer",
    "Owner Representative",
    "Inspector"
];

export const COMPANIES = [
    "Apex Construction Services",
    "Design Studio International",
    "Miller & Associates Engineers",
    "Volt Electric Inc.",
    "Hardrock Concrete LLC",
    "Exterior Concepts LLC",
    "Riverside Health Trust",
    "Apex MEP Consulting",
    "Industrial Logistics Architects",
    "Metropolitan Design Group",
    "Prairie Material",
    "Structural Supply Co.",
    "Centria Metal Enclosures"
];