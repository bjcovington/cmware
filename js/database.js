export const projects = [
    { id: "RIV-104", name: "Riverside Medical Center", phase: "Interior buildout", value: 48250000 },
    { id: "CIV-221", name: "Civic Hall Expansion", phase: "Structural steel", value: 31800000 },
    { id: "HAR-088", name: "Harbor Logistics Yard", phase: "Closeout", value: 12600000 }
];

export const metrics = [
    ["Open RFIs", "18", "4 due this week", "warn"],
    ["Closed RFIs", "146", "92% on time", "good"],
    ["Open Submittals", "32", "11 in review", "warn"],
    ["Returned Submittals", "214", "8 returned today", "good"],
    ["Pending Changes", "12", "$842K exposure", "bad"],
    ["Approved CO Value", "$1.84M", "3.8% of contract", "good"],
    ["Pending CO Value", "$760K", "Awaiting owner", "warn"],
    ["Engineer Response", "6.2d", "Avg RFI response", "good"],
    ["Submittal Review", "8.5d", "Avg review cycle", "warn"],
    ["Contract Value", "$48.25M", "Base plus approved", "neutral"],
    ["Budget Remaining", "$6.7M", "14% available", "good"]
];

export const activity = [
    ["RFI-1042 answered", "Level 03 framing detail clarified by design team.", "2h ago"],
    ["Submittal 07 42 13 returned", "Metal panels marked revise and resubmit.", "5h ago"],
    ["CE-033 routed", "Temporary power relocation sent to estimator.", "Yesterday"],
    ["ASI-018 issued", "Lobby soffit revisions added to documents.", "Jul 20"]
];

export const deadlines = [
    ["Structural shop drawings", "Due Jul 24", "warning"],
    ["Owner change review", "Due Jul 26", "info"],
    ["Firestopping inspection", "Due Jul 29", "neutral"],
    ["Monthly executive report", "Due Aug 1", "success"]
];

export const records = [
    {
        id: "rfi-1042",
        module: "rfis",
        number: "RFI-1042",
        title: "Level 03 head-of-wall detail",
        status: "Open",
        ballInCourt: "Architect",
        due: "2026-07-24",
        priority: "High",
        description: "Clarify rated assembly termination at intersecting beam line."
    },
    {
        id: "sub-0715",
        module: "submittals",
        number: "SUB-0715",
        title: "Curtain wall anchors",
        status: "In Review",
        ballInCourt: "Structural",
        due: "2026-07-26",
        priority: "Normal",
        description: "Anchor calculations and embeds for west elevation curtain wall."
    },
    {
        id: "ce-0033",
        module: "change-events",
        number: "CE-0033",
        title: "Temporary power relocation",
        status: "Pricing",
        ballInCourt: "Estimator",
        due: "2026-07-28",
        priority: "High",
        cost: 84200,
        description: "Relocate temporary distribution to clear revised ambulance bay work."
    },
    {
        id: "co-0012",
        module: "change-orders",
        number: "CO-0012",
        title: "South canopy revisions",
        status: "Approved",
        ballInCourt: "Owner",
        due: "Complete",
        priority: "Normal",
        cost: 184000,
        description: "Approved canopy framing and glazing changes."
    },
    {
        id: "asi-0018",
        module: "asis",
        number: "ASI-0018",
        title: "Lobby soffit coordination",
        status: "Issued",
        ballInCourt: "GC",
        due: "2026-07-30",
        priority: "Normal",
        description: "Revised soffit layout to coordinate with sprinkler mains."
    },
    {
        id: "ccd-0007",
        module: "ccds",
        number: "CCD-0007",
        title: "OR ceiling support revisions",
        status: "Issued",
        ballInCourt: "GC",
        due: "2026-08-02",
        priority: "High",
        cost: 64000,
        description: "Directive for revised support steel pending final change pricing."
    },
    {
        id: "pr-0021",
        module: "proposal-requests",
        number: "PR-0021",
        title: "Add level 02 nurse call devices",
        status: "Submitted",
        ballInCourt: "Electrical",
        due: "2026-08-04",
        priority: "Normal",
        cost: 28500,
        description: "Request proposal for additional devices shown in owner review comments."
    }
];
