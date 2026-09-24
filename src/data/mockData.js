// Project Drishti - Operation Blackhawk Knowledge Graph & Synthetic Crime Data

export const INITIAL_NODES = [
  // PERSONS
  {
    id: "p1",
    label: "Rahul Saxena",
    type: "PERSON",
    role: "Syndicate Mastermind",
    riskScore: 94,
    phone: "+91 9999888777",
    aliases: ["Kingpin", "R. Saxena"],
    status: "Wanted",
    cell: "Leadership Cell",
    details: "Suspected mastermind of transnational smuggling and hawala network. Operates through front organizations."
  },
  {
    id: "p2",
    label: "Rohit Sharma",
    type: "PERSON",
    role: "Key Intermediary",
    riskScore: 91,
    phone: "+91 9876543210",
    aliases: ["Phantom", "Rohit S."],
    status: "Under Surveillance",
    cell: "Operations Cell",
    details: "Primary liaison officer between Rahul Saxena and ground distribution logistics. High betweenness centrality."
  },
  {
    id: "p3",
    label: "Sandeep Kumar",
    type: "PERSON",
    role: "Logistics Manager",
    riskScore: 84,
    phone: "+91 9811223344",
    aliases: ["Sandy"],
    status: "Arrested",
    cell: "Logistics Cell",
    details: "Coordinates vehicular transport of contraband across state borders. Directly linked to vehicle PB10AB1234."
  },
  {
    id: "p4",
    label: "Vikas Verma",
    type: "PERSON",
    role: "Financial Handler",
    riskScore: 88,
    phone: "+91 9899001122",
    aliases: ["V. Verma", "Vicky"],
    status: "Under Investigation",
    cell: "Finance Cell",
    details: "Manages offshore shell accounts and structured wire transfers for Global Apex Trading."
  },
  {
    id: "p5",
    label: "Aman Kapoor",
    type: "PERSON",
    role: "Local Distributor",
    riskScore: 72,
    phone: "+91 9711002233",
    aliases: ["Aman K."],
    status: "Under Surveillance",
    cell: "Logistics Cell",
    details: "Handles street distribution and local cash collection in Sector 17."
  },
  {
    id: "p6",
    label: "Priya Malhotra",
    type: "PERSON",
    role: "Hawala Operator",
    riskScore: 82,
    phone: "+91 9800112233",
    aliases: ["Priya M.", "Madam P"],
    status: "Under Investigation",
    cell: "Finance Cell",
    details: "Facilitates unrecorded cash transfers via jeweller networks."
  },
  {
    id: "p7",
    label: "David Vance",
    type: "PERSON",
    role: "International Supplier",
    riskScore: 78,
    phone: "+44 7911123456",
    aliases: ["The Brit"],
    status: "Interpol Alert",
    cell: "Leadership Cell",
    details: "Overseas supplier routing shipments via maritime shipping routes."
  },

  // ORGANIZATIONS
  {
    id: "o1",
    label: "Global Apex Trading Ltd",
    type: "ORGANIZATION",
    role: "Front Enterprise",
    riskScore: 89,
    registration: "REG-2021-9981",
    status: "Account Frozen",
    cell: "Finance Cell",
    details: "Import-export company used for layering financial proceeds."
  },
  {
    id: "o2",
    label: "Shell Capital Corp",
    type: "ORGANIZATION",
    role: "Offshore Entity",
    riskScore: 85,
    registration: "OFF-BVI-4401",
    status: "Under Audit",
    cell: "Finance Cell",
    details: "BVI registered entity receiving wire transfers from Vikas Verma."
  },
  {
    id: "o3",
    label: "Shadow Security Services",
    type: "ORGANIZATION",
    role: "Enforcement Wing",
    riskScore: 68,
    registration: "SEC-2023-112",
    status: "Active",
    cell: "Operations Cell",
    details: "Private security firm providing physical protection for safehouses."
  },

  // PHONES
  {
    id: "ph1",
    label: "+91 9999888777",
    type: "PHONE",
    carrier: "Airtel Secret Line",
    riskScore: 92,
    details: "Encrypted burner device active near Rahul Saxena's primary residence."
  },
  {
    id: "ph2",
    label: "+91 9876543210",
    type: "PHONE",
    carrier: "Jio Secure",
    riskScore: 88,
    details: "Registered under alias R. Sharma. Used for high-frequency coordination."
  },
  {
    id: "ph3",
    label: "+91 9811223344",
    type: "PHONE",
    carrier: "Vi Business",
    riskScore: 76,
    details: "Tapped line active during interstate drug shipments."
  },

  // VEHICLES
  {
    id: "v1",
    label: "PB10AB1234",
    type: "VEHICLE",
    model: "Black SUV (Fortuner)",
    riskScore: 86,
    owner: "Rohit Sharma",
    details: "Spotted at Safehouse B-42 during nocturnal meetings."
  },
  {
    id: "v2",
    label: "DL3CC8899",
    type: "VEHICLE",
    model: "Commercial Cargo Truck",
    riskScore: 79,
    owner: "Sandeep Kumar",
    details: "Custom false-bottom cargo truck used for concealed transport."
  },

  // LOCATIONS
  {
    id: "l1",
    label: "Safehouse B-42 (Manali)",
    type: "LOCATION",
    category: "Command Base",
    riskScore: 91,
    coordinates: "32.2432° N, 77.1892° E",
    details: "Secluded property identified as syndicate hub during surveillance."
  },
  {
    id: "l2",
    label: "Sector 17 (Chandigarh)",
    type: "LOCATION",
    category: "Drop Zone",
    riskScore: 74,
    coordinates: "30.7415° N, 76.7791° E",
    details: "Public commercial center used for quick handovers."
  },
  {
    id: "l3",
    label: "Warehouse 9 (Port Enclave)",
    type: "LOCATION",
    category: "Storage",
    riskScore: 83,
    coordinates: "18.9438° N, 72.8359° E",
    details: "Leased by Global Apex Trading. Primary customs storage."
  },

  // BANK ACCOUNTS
  {
    id: "b1",
    label: "ACC-99812 (Offshore)",
    type: "BANK_ACCOUNT",
    bank: "Swiss Union Bank",
    riskScore: 93,
    holder: "Vikas Verma",
    details: "High-value destination account receiving layered transfers."
  },
  {
    id: "b2",
    label: "ACC-44102 (Corporate)",
    type: "BANK_ACCOUNT",
    bank: "HDFC Commercial",
    riskScore: 87,
    holder: "Global Apex Trading",
    details: "Corporate account flagged for anomalous ₹9,500,000 deposit."
  },
  {
    id: "b3",
    label: "ACC-77631 (Hawala Pool)",
    type: "BANK_ACCOUNT",
    bank: "ICICI Private",
    riskScore: 80,
    holder: "Priya Malhotra",
    details: "Multiple small daily deposits consolidating into Hawala disbursements."
  },

  // CASE / FIRs
  {
    id: "c1",
    label: "FIR-2026/089",
    type: "CASE",
    title: "Narcotics Seizure & Trafficking",
    status: "Active Investigation",
    riskScore: 90,
    date: "2026-08-12",
    details: "Seizure of 45kg contraband near Manali checkpoint."
  },
  {
    id: "c2",
    label: "FIR-2026/104",
    type: "CASE",
    title: "Hawala & Money Laundering Racket",
    status: "Under Prosecution",
    riskScore: 88,
    date: "2026-08-20",
    details: "Uncovered multi-state money laundering ring linked to Global Apex."
  }
];

export const INITIAL_EDGES = [
  // Person -> Phone
  { id: "e1", from: "p1", to: "ph1", label: "USES", weight: 9, source: "Surveillance Log #102" },
  { id: "e2", from: "p2", to: "ph2", label: "USES", weight: 8, source: "CDR Report #771" },
  { id: "e3", from: "p3", to: "ph3", label: "USES", weight: 7, source: "CDR Report #771" },

  // Calls between Suspects
  { id: "e4", from: "p1", to: "p2", label: "CALLS (42x)", weight: 10, type: "communication", details: "Frequent encrypted calls prior to drug drops" },
  { id: "e5", from: "p2", to: "p3", label: "CALLS (28x)", weight: 8, type: "communication", details: "Logistics movement confirmation calls" },
  { id: "e6", from: "p3", to: "p5", label: "CALLS (19x)", weight: 6, type: "communication", details: "Local distribution coordination" },
  { id: "e7", from: "p1", to: "p7", label: "CALLS (12x)", weight: 7, type: "communication", details: "International VoIP communications" },

  // Vehicles & Locations
  { id: "e8", from: "p2", to: "v1", label: "OWNS", weight: 8, source: "RTO Database" },
  { id: "e9", from: "p3", to: "v2", label: "OPERATES", weight: 7, source: "RTO Database" },
  { id: "e10", from: "p2", to: "l1", label: "VISITED", weight: 9, date: "2026-08-10", details: "Spotted at Safehouse B-42 at 01:30 AM" },
  { id: "e11", from: "p3", to: "l1", label: "VISITED", weight: 8, date: "2026-08-10", details: "Co-located with Rohit Sharma" },
  { id: "e12", from: "p5", to: "l2", label: "OPERATES AT", weight: 6, details: "Sector 17 drop point" },
  { id: "e13", from: "v2", to: "l3", label: "LOGGED AT", weight: 7, details: "Warehouse 9 loading dock" },

  // Financial Connections
  { id: "e14", from: "p4", to: "o1", label: "DIRECTOR", weight: 9, source: "ROC Filings" },
  { id: "e15", from: "p1", to: "o2", label: "BENEFICIARY", weight: 10, source: "Intelligence Report #44" },
  { id: "e16", from: "p4", to: "b1", label: "CONTROLS", weight: 9, source: "Bank Audit" },
  { id: "e17", from: "o1", to: "b2", label: "ACCOUNT OWNER", weight: 9, source: "Bank Audit" },
  { id: "e18", from: "p6", to: "b3", label: "CONTROLS", weight: 8, source: "FIU-IND Intelligence" },
  { id: "e19", from: "b2", to: "b1", label: "TRANSFERRED ₹9.5M", weight: 10, type: "financial", details: "Anomalous single-day transfer" },
  { id: "e20", from: "b1", to: "b3", label: "TRANSFERRED ₹5.0M", weight: 9, type: "financial", details: "Layered hawala payout" },
  { id: "e21", from: "p2", to: "p4", label: "RECEIVED CASH", weight: 8, type: "financial", details: "Hawala cash handover" },

  // FIR & Cases
  { id: "e22", from: "p2", to: "c1", label: "MENTIONED IN", weight: 9, source: "FIR-2026/089" },
  { id: "e23", from: "p3", to: "c1", label: "ARRESTED IN", weight: 10, source: "FIR-2026/089" },
  { id: "e24", from: "p4", to: "c2", label: "NAMED IN", weight: 9, source: "FIR-2026/104" },
  { id: "e25", from: "p6", to: "c2", label: "NAMED IN", weight: 8, source: "FIR-2026/104" }
];

export const SAMPLE_DOCUMENTS = [
  {
    id: "doc1",
    title: "FIR Narrative #FIR-2026/089 (Manali Seizure)",
    type: "Police Report / FIR",
    date: "12 August 2026",
    content: `On 12 August 2026 at approximately 01:30 AM, intelligence team intercepted vehicle PB10AB1234 (Black Fortuner SUV) near Safehouse B-42, Manali. Suspect Rohit Sharma was spotted meeting Sandeep Kumar. Rohit Sharma was using phone number +91 9876543210. Search of cargo vehicle DL3CC8899 driven by Sandeep Kumar led to recovery of contraband. Communication logs indicate Rohit Sharma received 42 calls from Rahul Saxena (+91 9999888777) prior to the operation. Both suspects had previously visited Sector 17 Chandigarh.`
  },
  {
    id: "doc2",
    title: "Financial Intelligence Unit Report #FIU-2026/902",
    type: "Financial Audit",
    date: "18 August 2026",
    content: `Suspicious Transaction Report flagged account ACC-44102 belonging to Global Apex Trading Ltd. Director Vikas Verma (+91 9899001122) authorized a wire transfer of ₹9,500,000 to offshore account ACC-99812. Subsequently, ACC-99812 routed ₹5,000,000 to account ACC-77631 controlled by Priya Malhotra (+91 9800112233). This matches hawala layering patterns linked to Shell Capital Corp.`
  },
  {
    id: "doc3",
    title: "CDR Surveillance Intercept #CDR-771",
    type: "Call Detail Record",
    date: "25 August 2026",
    content: `Call Detail Records show intense burst communication between Sandeep Kumar (+91 9811223344) and Aman Kapoor (+91 9711002233). 19 calls recorded in 3 hours. Cell tower triangulation places both handsets near Warehouse 9, Port Enclave.`
  }
];

export const ENTITY_RESOLUTION_CANDIDATES = [
  {
    id: "er1",
    primary: { id: "p2", label: "Rohit Sharma", phone: "+91 9876543210", vehicle: "PB10AB1234", org: "Shadow Security" },
    secondary: { id: "p2_dup", label: "R. Sharma", phone: "+91 9876543210", vehicle: "PB10AB1234", location: "Sector 17" },
    confidence: 94,
    rationale: [
      "Exact Phone Number Match (+91 9876543210)",
      "Same Vehicle Registration (PB10AB1234)",
      "High Name Similarity Score (92%)",
      "Co-location overlap in Sector 17"
    ]
  },
  {
    id: "er2",
    primary: { id: "p4", label: "Vikas Verma", phone: "+91 9899001122", account: "ACC-99812", org: "Global Apex" },
    secondary: { id: "p4_dup", label: "Vicky Verma", phone: "+91 9899001122", account: "ACC-99812", org: "Shell Capital" },
    confidence: 89,
    rationale: [
      "Exact Phone Number Match (+91 9899001122)",
      "Matching Swiss Bank Account (ACC-99812)",
      "Shared Organization Ownership Network"
    ]
  },
  {
    id: "er3",
    primary: { id: "p1", label: "Rahul Saxena", phone: "+91 9999888777", alias: "Kingpin" },
    secondary: { id: "p1_dup", label: "R. K. Saxena", phone: "+91 9999888777", alias: "The Boss" },
    confidence: 85,
    rationale: [
      "Burner Phone Triangulation Match (+91 9999888777)",
      "Alias Cross-Reference in Intelligence Report #44"
    ]
  }
];

export const ANOMALIES_LIST = [
  {
    id: "anom1",
    title: "Multi-Hop Money Laundering Chain",
    severity: "CRITICAL",
    category: "Financial Layering",
    entities: ["Vikas Verma", "Global Apex Trading", "ACC-44102", "ACC-99812", "ACC-77631", "Priya Malhotra"],
    description: "Layered sequence of transactions moving ₹9,500,000 from corporate account to offshore Swiss account, followed by ₹5,000,000 disbursement to Hawala operator within 24 hours.",
    riskImpact: "+25 Risk to Vikas Verma & Priya Malhotra",
    detectedAt: "2026-08-18 14:22:00"
  },
  {
    id: "anom2",
    title: "Pre-Incident Call Frequency Spike",
    severity: "HIGH",
    category: "Communication Burst",
    entities: ["Rahul Saxena", "Rohit Sharma", "Sandeep Kumar"],
    description: "42 encrypted calls registered between Rahul Saxena and Rohit Sharma in 4 hours preceding the Manali contraband movement.",
    riskImpact: "+20 Risk to Rohit Sharma",
    detectedAt: "2026-08-11 23:45:00"
  },
  {
    id: "anom3",
    title: "Geographical Co-Location Overlap",
    severity: "HIGH",
    category: "Spatial Anomaly",
    entities: ["Rohit Sharma", "Sandeep Kumar", "Safehouse B-42 (Manali)"],
    description: "Multiple high-risk suspects detected at Safehouse B-42 between 01:00 AM and 03:00 AM off normal operational routes.",
    riskImpact: "+18 Co-location Risk",
    detectedAt: "2026-08-12 01:30:00"
  },
  {
    id: "anom4",
    title: "Anomalous Transaction Volume Spike",
    severity: "MEDIUM",
    category: "Financial Volume",
    entities: ["Global Apex Trading Ltd", "ACC-44102"],
    description: "Single deposit of ₹9,500,000 exceeds 12-month average transaction baseline by 840%.",
    riskImpact: "+15 Account Flag",
    detectedAt: "2026-08-18 11:05:00"
  }
];

export const TIMELINE_EVENTS = [
  {
    id: "evt1",
    date: "2026-08-01",
    time: "10:00 AM",
    title: "Global Apex Trading Ltd Account Opened",
    type: "financial",
    suspects: ["Vikas Verma"],
    description: "Vikas Verma opens HDFC Corporate Account ACC-44102 under Global Apex Trading Ltd.",
    icon: "Building"
  },
  {
    id: "evt2",
    date: "2026-08-10",
    time: "01:30 AM",
    title: "Nocturnal Meeting at Safehouse B-42",
    type: "surveillance",
    suspects: ["Rohit Sharma", "Sandeep Kumar"],
    description: "Surveillance teams record Rohit Sharma (PB10AB1234) meeting Sandeep Kumar at Manali Safehouse.",
    icon: "MapPin"
  },
  {
    id: "evt3",
    date: "2026-08-11",
    time: "11:45 PM",
    title: "Burst Communication Recorded",
    type: "communication",
    suspects: ["Rahul Saxena", "Rohit Sharma"],
    description: "42 calls exchanged between Rahul Saxena and Rohit Sharma across encrypted burner lines.",
    icon: "PhoneCall"
  },
  {
    id: "evt4",
    date: "2026-08-12",
    time: "02:15 AM",
    title: "Manali Checkpoint Intercept (FIR-2026/089)",
    type: "police_action",
    suspects: ["Sandeep Kumar", "Rohit Sharma"],
    description: "Police intercept cargo truck DL3CC8899. Contraband seized. Sandeep Kumar arrested.",
    icon: "ShieldAlert"
  },
  {
    id: "evt5",
    date: "2026-08-18",
    time: "02:22 PM",
    title: "Layered Wire Transfer Executed",
    type: "financial",
    suspects: ["Vikas Verma", "Priya Malhotra"],
    description: "₹9.5M wired from ACC-44102 to Swiss ACC-99812, followed by ₹5.0M hawala payout to ACC-77631.",
    icon: "DollarSign"
  },
  {
    id: "evt6",
    date: "2026-08-20",
    time: "04:00 PM",
    title: "Money Laundering Probe Initiated (FIR-2026/104)",
    type: "police_action",
    suspects: ["Vikas Verma", "Priya Malhotra", "Rahul Saxena"],
    description: "Financial Intelligence Unit registers FIR-2026/104 naming Global Apex and Shell Capital Corp.",
    icon: "FileText"
  }
];
