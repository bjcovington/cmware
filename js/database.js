export const projects = [
    {
        id: "RIV-104",
        name: "Riverside Medical Center",
        number: "PRJ-2026-04",
        address: "1450 River Park Blvd, Suite 300, Chicago, IL",
        phase: "Interior Buildout & Envelope",
        value: 48250000,
        squareFeet: 215000,
        startDate: "2025-09-01",
        completionDate: "2027-03-15",
        architect: "Design Studio International",
        generalContractor: "Apex Construction Services",
        owner: "Riverside Health Trust"
    },
    {
        id: "CIV-221",
        name: "Civic Hall Expansion",
        number: "PRJ-2026-08",
        address: "400 E Michigan Ave, Chicago, IL",
        phase: "Structural Steel Framing",
        value: 31800000,
        squareFeet: 140000,
        startDate: "2026-01-10",
        completionDate: "2027-08-30",
        architect: "Metropolitan Design Group",
        generalContractor: "Apex Construction Services",
        owner: "City of Chicago Infrastructure"
    },
    {
        id: "HAR-088",
        name: "Harbor Logistics Yard",
        number: "PRJ-2025-12",
        address: "880 Port Drive, Gary, IN",
        phase: "Closeout & Commissioning",
        value: 12600000,
        squareFeet: 320000,
        startDate: "2024-11-01",
        completionDate: "2026-09-01",
        architect: "Industrial Logistics Architects",
        generalContractor: "Apex Construction Services",
        owner: "Harbor Logistics LLC"
    }
];

export const contacts = [
    {
        id: "cnt-101",
        name: "Sarah Jenkins",
        email: "sjenkins@designstudio.com",
        phone: "(312) 555-0142",
        company: "Design Studio International",
        role: "Lead Architect",
        discipline: "Architectural",
        avatar: "SJ"
    },
    {
        id: "cnt-102",
        name: "David Miller",
        email: "dmiller@millereng.com",
        phone: "(312) 555-0189",
        company: "Miller & Associates Engineers",
        role: "Structural Engineer",
        discipline: "Structural",
        avatar: "DM"
    },
    {
        id: "cnt-103",
        name: "Marcus Vance",
        email: "marcus.vance@apexconstruct.com",
        phone: "(312) 555-0110",
        company: "Apex Construction",
        role: "Senior Project Manager",
        discipline: "General Contractor",
        avatar: "MV"
    },
    {
        id: "cnt-104",
        name: "Carlos Rodriguez",
        email: "carlos@voltelectric.com",
        phone: "(312) 555-0199",
        company: "Volt Electric Inc.",
        role: "Electrical Trade Lead",
        discipline: "Electrical",
        avatar: "CR"
    },
    {
        id: "cnt-105",
        name: "Elena Rostova",
        email: "elena.rostova@riversidehealth.org",
        phone: "(312) 555-0123",
        company: "Riverside Health Trust",
        role: "Owner Representative",
        discipline: "Owner",
        avatar: "ER"
    },
    {
        id: "cnt-106",
        name: "Robert Vance",
        email: "rvance@mepengineers.com",
        phone: "(312) 555-0177",
        company: "Apex MEP Consulting",
        role: "Mechanical Lead Engineer",
        discipline: "Mechanical",
        avatar: "RV"
    }
];

export const activity = [
    ["RFI-1042 answered", "Level 03 framing detail clarified by Sarah Jenkins (Design Studio).", "2h ago"],
    ["Submittal 07 42 13 returned", "Metal panel shop drawings marked Revise and Resubmit.", "5h ago"],
    ["CE-0033 pricing submitted", "Temporary power relocation pricing logged at $84,200.", "Yesterday"],
    ["ASI-0018 issued", "Lobby soffit coordination details posted by Lead Architect.", "Jul 20"]
];

export const deadlines = [
    ["Structural shop drawings review", "Due Jul 24", "warning"],
    ["Owner change review (CE-0033)", "Due Jul 26", "info"],
    ["Firestopping mock-up inspection", "Due Jul 29", "neutral"],
    ["Monthly executive pay application", "Due Aug 1", "success"]
];

export const records = [
    {
        id: "rfi-1042",
        module: "rfis",
        number: "RFI-1042",
        title: "Level 03 head-of-wall detail at perimeter beam",
        status: "Open",
        ballInCourt: "Sarah Jenkins (Design Studio International)",
        assignedTo: "Sarah Jenkins",
        assignedCompany: "Design Studio International",
        due: "2026-07-24",
        priority: "High",
        specSection: "09 22 16 - Non-Structural Metal Framing",
        drawingNumber: "A-302 / Detail 4",
        costImpact: "$12,500",
        scheduleImpact: "2 Days",
        question: "Drawing A-302 Detail 4 shows a slotted track attachment at the underside of structural steel beam B-304. However, structural sheet S-201 calls out a 2-inch deflection gap while architectural shows 1-inch. Please clarify which gap requirement governs for UL Assembly HW-D-0182.",
        suggestion: "General Contractor recommends utilizing 2-inch deep leg track with 1.5-inch deflection allowance as detailed in UL Assembly HW-D-0182 to accommodate structural deflection while maintaining fire rating.",
        officialAnswer: "Pending Architect review. Preliminary feedback concurs with GC recommendation subject to structural engineer sign-off.",
        attachments: ["UL-HW-D-0182-Cutsheet.pdf", "Beam-Deflection-Detail-Markup.pdf"],
        createdAt: "2026-07-20"
    },
    {
        id: "rfi-1041",
        module: "rfis",
        number: "RFI-1041",
        title: "Emergency generator exhaust duct routing at Level 01",
        status: "Closed",
        ballInCourt: "Robert Vance (Apex MEP Consulting)",
        assignedTo: "Robert Vance",
        assignedCompany: "Apex MEP Consulting",
        due: "2026-07-18",
        priority: "Critical",
        specSection: "23 51 00 - Breechings, Chimneys, and Stacks",
        drawingNumber: "M-101 & M-502",
        costImpact: "$0",
        scheduleImpact: "0 Days",
        question: "Exhaust duct routing collides with main 10-inch chilled water supply pipe at Grid line D-4. Request approved offset dimension.",
        suggestion: "Route exhaust duct 18 inches to the east above cable tray tier 2.",
        officialAnswer: "Approved as suggested. Shift duct 18 inches East. Ensure 2-inch clearance to fire-rated enclosure.",
        attachments: ["M-101-Clash-Snapshot.pdf"],
        createdAt: "2026-07-12"
    },
    {
        id: "sub-0715",
        module: "submittals",
        number: "SUB-0715",
        title: "Insulated Metal Wall Panels - Product Data & Color Samples",
        type: "Product Data",
        status: "In Review",
        ballInCourt: "Sarah Jenkins (Design Studio International)",
        assignedTo: "Sarah Jenkins",
        assignedCompany: "Design Studio International",
        subcontractor: "Centria Metal Enclosures / Exterior Concepts",
        specSection: "07 42 13 - Metal Wall Panels",
        manufacturer: "Centria Formawall",
        leadTime: "6 Weeks",
        due: "2026-07-26",
        priority: "Normal",
        description: "Comprehensive product data cutsheets, thermal performance test results, factory finish specifications, and standard 3-coat Kynar 500 color chips.",
        question: "Submitting standard metallic silver chips and custom charcoal metallic chips for exterior canopy accent band.",
        officialAnswer: "Under review by Architectural enclosure specialist.",
        attachments: ["Centria-Formawall-TechnicalData.pdf", "Color-Palette-Selection.pdf"],
        createdAt: "2026-07-15"
    },
    {
        id: "sub-0330",
        module: "submittals",
        number: "SUB-0330",
        title: "Cast-in-Place Concrete Mix Designs & Reinforcing Steel Shop Drawings",
        type: "Shop Drawings",
        status: "Approved as Noted",
        ballInCourt: "David Miller (Miller & Associates)",
        assignedTo: "David Miller",
        assignedCompany: "Miller & Associates Engineers",
        subcontractor: "Prairie Material / Hardrock Concrete",
        specSection: "03 30 00 - Cast-in-Place Concrete",
        manufacturer: "Prairie Mix 5000 PSI",
        leadTime: "1 Week",
        due: "2026-07-20",
        priority: "High",
        description: "5000 PSI mix design data with air entrainment additives and rebar placement shop drawings for Level 03 slab pour.",
        officialAnswer: "Approved as noted: Ensure cylinder testing frequency strictly complies with Spec Section 03 30 00 Part 3.4.",
        attachments: ["Mix-Design-5000PSI.pdf", "Rebar-Placement-A1.pdf"],
        createdAt: "2026-07-10"
    },
    {
        id: "ce-0033",
        module: "change-events",
        number: "CE-0033",
        title: "Temporary power distribution relocation for ambulance bay",
        status: "Pricing",
        ballInCourt: "Carlos Rodriguez (Volt Electric Inc.)",
        assignedTo: "Carlos Rodriguez",
        assignedCompany: "Volt Electric Inc.",
        reason: "Field Condition / Site Variance",
        due: "2026-07-28",
        priority: "High",
        cost: 84200,
        description: "Relocate temporary 400A distribution transformer and temporary feeder lines to clear revised ambulance bay excavation area.",
        createdAt: "2026-07-18"
    },
    {
        id: "co-0012",
        module: "change-orders",
        number: "CO-0012",
        title: "South Entrance Canopy Structural Revisions",
        status: "Approved",
        ballInCourt: "Elena Rostova (Riverside Health Trust)",
        assignedTo: "Elena Rostova",
        assignedCompany: "Riverside Health Trust",
        reason: "Owner Requested Scope Addition",
        due: "Complete",
        priority: "Normal",
        cost: 184000,
        description: "Includes structural steel framing reinforcement, clear laminated glass canopy panels, and integrated recessed LED lighting.",
        createdAt: "2026-07-02"
    },
    {
        id: "asi-0018",
        module: "asis",
        number: "ASI-0018",
        title: "Main Lobby Soffit Elevation & Lighting Coordination",
        status: "Issued",
        ballInCourt: "Marcus Vance (Apex Construction)",
        assignedTo: "Marcus Vance",
        assignedCompany: "Apex Construction",
        due: "2026-07-30",
        priority: "Normal",
        description: "Architectural Supplemental Instruction issuing revised soffit framing details to accommodate sprinkler main drops.",
        createdAt: "2026-07-20"
    },
    {
        id: "ccd-0007",
        module: "ccds",
        number: "CCD-0007",
        title: "Operating Room Medical Gas Ceiling Support Steel Directive",
        status: "Issued",
        ballInCourt: "Marcus Vance (Apex Construction)",
        assignedTo: "Marcus Vance",
        assignedCompany: "Apex Construction",
        due: "2026-08-02",
        priority: "High",
        cost: 64000,
        description: "Unilateral directive to proceed with supplementary structural steel supports for OR boom anchors pending final pricing.",
        createdAt: "2026-07-19"
    },
    {
        id: "pr-0021",
        module: "proposal-requests",
        number: "PR-0021",
        title: "Add Level 02 Patient Room Nurse Call Stations & AV Drops",
        status: "Submitted",
        ballInCourt: "Carlos Rodriguez (Volt Electric Inc.)",
        assignedTo: "Carlos Rodriguez",
        assignedCompany: "Volt Electric Inc.",
        due: "2026-08-04",
        priority: "Normal",
        cost: 28500,
        description: "Owner pricing request for adding 14 additional wall-mounted nurse call devices in Level 02 recovery suites.",
        createdAt: "2026-07-17"
    }
];

export const dailyLogs = [
    {
        id: "log-20260723",
        date: "2026-07-23",
        author: "Marcus Vance",
        weather: "78°F, Clear & Sunny",
        wind: "5 mph SW",
        siteConditions: "Dry and clear. Ideal exterior concrete pour and framing conditions.",
        headcountTotal: 42,
        trades: [
            { company: "Apex Construction", trade: "General Labor & Carpenters", count: 12, hours: 96 },
            { company: "Volt Electric Inc.", trade: "Electricians", count: 14, hours: 112 },
            { company: "Hardrock Concrete", trade: "Concrete Workers & Rebar Crew", count: 10, hours: 80 },
            { company: "Exterior Concepts", trade: "Glaziers & Panel Installers", count: 6, hours: 48 }
        ],
        notes: "Completed Level 03 east wing slab preparation. Electrical rough-in in progress on Level 02. Exterior metal panel mock-up installed at south entrance.",
        safety: "No safety incidents or near misses reported. Tool box talk conducted on fall protection at 07:00 AM.",
        deliveries: "Received 3 trucks of steel stud framing (Structural Supply Co.) and 1 batch truck of slurry mix."
    },
    {
        id: "log-20260722",
        date: "2026-07-22",
        author: "Marcus Vance",
        weather: "74°F, Partly Cloudy",
        wind: "8 mph W",
        siteConditions: "Good site access. Dry conditions.",
        headcountTotal: 38,
        trades: [
            { company: "Apex Construction", trade: "General Labor", count: 10, hours: 80 },
            { company: "Volt Electric Inc.", trade: "Electricians", count: 12, hours: 96 },
            { company: "Hardrock Concrete", trade: "Concrete Workers", count: 16, hours: 128 }
        ],
        notes: "Poured 120 CY of concrete for ambulance ramp retaining wall. Inspection passed by City of Chicago inspector.",
        safety: "Daily site safety audit completed. Housekeeping rated Good.",
        deliveries: "Rebar delivery #4 unloaded."
    }
];

export const drawings = [
    {
        id: "dwg-a101",
        sheetNumber: "A-101",
        title: "Level 01 Architectural Floor Plan & Key Notes",
        discipline: "Architectural",
        rev: "Rev 3",
        issueDate: "2026-06-15",
        status: "Current",
        description: "Main lobby, emergency entrance, diagnostic imaging layout, and exterior wall wall types."
    },
    {
        id: "dwg-a302",
        sheetNumber: "A-302",
        title: "Exterior Wall Sections & Head-of-Wall Details",
        discipline: "Architectural",
        rev: "Rev 2",
        issueDate: "2026-07-01",
        status: "Current",
        description: "Curtain wall attachments, deflection track details, and perimeter flashing."
    },
    {
        id: "dwg-s201",
        sheetNumber: "S-201",
        title: "Level 03 Structural Framing & Decking Plan",
        discipline: "Structural",
        rev: "Rev 4",
        issueDate: "2026-07-10",
        status: "Current",
        description: "Composite metal deck spans, beam schedules, and moment connection details."
    },
    {
        id: "dwg-m101",
        sheetNumber: "M-101",
        title: "Level 01 Mechanical HVAC Duct Layout",
        discipline: "Mechanical",
        rev: "Rev 1",
        issueDate: "2026-05-20",
        status: "Current",
        description: "Air handling unit supply & return ductwork, VAV box schedules."
    },
    {
        id: "dwg-e101",
        sheetNumber: "E-101",
        title: "Level 01 Electrical Power & Lighting Distribution",
        discipline: "Electrical",
        rev: "Rev 2",
        issueDate: "2026-06-08",
        status: "Current",
        description: "Panelboard schedules, emergency branch circuits, and normal power feeders."
    }
];

export const budget = [
    {
        costCode: "01 31 00",
        description: "Project Management & Field Supervision",
        originalBudget: 2400000,
        approvedChanges: 45000,
        revisedBudget: 2445000,
        commitments: 2400000,
        pendingExposure: 15000,
        remainingBalance: 30000
    },
    {
        costCode: "03 30 00",
        description: "Cast-in-Place Concrete & Reinforcing",
        originalBudget: 8600000,
        approvedChanges: 184000,
        revisedBudget: 8784000,
        commitments: 8650000,
        pendingExposure: 64000,
        remainingBalance: 70000
    },
    {
        costCode: "07 42 13",
        description: "Insulated Metal Panels & Envelope",
        originalBudget: 4200000,
        approvedChanges: 0,
        revisedBudget: 4200000,
        commitments: 4150000,
        pendingExposure: 84200,
        remainingBalance: -34200
    },
    {
        costCode: "26 00 00",
        description: "Electrical Distribution & Lighting",
        originalBudget: 6800000,
        approvedChanges: 28500,
        revisedBudget: 6828500,
        commitments: 6750000,
        pendingExposure: 28500,
        remainingBalance: 50000
    }
];

export const punchList = [
    {
        id: "pnch-001",
        number: "PNC-001",
        title: "Level 02 Room 204 Drywall Patch & Touch-Up",
        location: "Room 204 (ICU Suite)",
        assignedTrade: "Apex Construction (Drywall)",
        assignedPerson: "Marcus Vance",
        status: "Open",
        priority: "Normal",
        dueDate: "2026-07-28",
        description: "Patch hole at electrical conduit entry and repaint wall to match SW 7005."
    },
    {
        id: "pnch-002",
        number: "PNC-002",
        title: "Main Corridor Fire Door Seal Gap",
        location: "Corridor C-102",
        assignedTrade: "Exterior Concepts / Doors",
        assignedPerson: "Sarah Jenkins",
        status: "In Review",
        priority: "High",
        dueDate: "2026-07-25",
        description: "Intumescent smoke seal missing along top jamb of double door D-102B."
    }
];
