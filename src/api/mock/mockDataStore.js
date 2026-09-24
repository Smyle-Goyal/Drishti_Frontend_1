// Stateful Mock Backend Database Store
// Follows strict backend response contract:
// { entities: [...], relationships: [...], events: [...] }

export let mockInvestigationStore = {
  entities: [
    {
      id: "P001",
      type: "PERSON",
      name: "Rahul Saxena",
      confidence: 0.97,
      role: "Syndicate Mastermind",
      status: "Wanted",
      phone: "+91 9999888777",
      aliases: ["Kingpin", "R. Saxena"],
      cell: "Leadership Cell",
      details: "Suspected mastermind of transnational smuggling and hawala network. Operates through front organizations."
    },
    {
      id: "P002",
      type: "PERSON",
      name: "Rohit Sharma",
      confidence: 0.96,
      role: "Key Intermediary",
      status: "Under Surveillance",
      phone: "+91 9876543210",
      aliases: ["Phantom", "Rohit S."],
      cell: "Operations Cell",
      details: "Primary liaison officer between Rahul Saxena and ground distribution logistics. High betweenness centrality."
    },
    {
      id: "P003",
      type: "PERSON",
      name: "Sandeep Kumar",
      confidence: 0.94,
      role: "Logistics Manager",
      status: "Arrested",
      phone: "+91 9811223344",
      aliases: ["Sandy"],
      cell: "Logistics Cell",
      details: "Coordinates vehicular transport of contraband across state borders. Directly linked to vehicle PB10AB1234."
    },
    {
      id: "P004",
      type: "PERSON",
      name: "Vikas Verma",
      confidence: 0.95,
      role: "Financial Handler",
      status: "Under Investigation",
      phone: "+91 9899001122",
      aliases: ["V. Verma", "Vicky"],
      cell: "Finance Cell",
      details: "Manages offshore shell accounts and structured wire transfers for Global Apex Trading."
    },
    {
      id: "P005",
      type: "PERSON",
      name: "Aman Kapoor",
      confidence: 0.88,
      role: "Local Distributor",
      status: "Under Surveillance",
      phone: "+91 9711002233",
      aliases: ["Aman K."],
      cell: "Logistics Cell",
      details: "Handles street distribution and local cash collection in Sector 17."
    },
    {
      id: "P006",
      type: "PERSON",
      name: "Priya Malhotra",
      confidence: 0.92,
      role: "Hawala Operator",
      status: "Under Investigation",
      phone: "+91 9800112233",
      aliases: ["Priya M.", "Madam P"],
      cell: "Finance Cell",
      details: "Facilitates unrecorded cash transfers via jeweller networks."
    },
    {
      id: "P007",
      type: "PERSON",
      name: "David Vance",
      confidence: 0.85,
      role: "International Supplier",
      status: "Interpol Alert",
      phone: "+44 7911123456",
      aliases: ["The Brit"],
      cell: "Leadership Cell",
      details: "Overseas supplier routing shipments via maritime shipping routes."
    },

    // ORGANIZATIONS
    {
      id: "ORG001",
      type: "ORGANIZATION",
      name: "Global Apex Trading Ltd",
      confidence: 0.96,
      role: "Front Enterprise",
      registration: "REG-2021-9981",
      status: "Account Frozen",
      cell: "Finance Cell",
      details: "Import-export company used for layering financial proceeds."
    },
    {
      id: "ORG002",
      type: "ORGANIZATION",
      name: "Shell Capital Corp",
      confidence: 0.93,
      role: "Offshore Entity",
      registration: "OFF-BVI-4401",
      status: "Under Audit",
      cell: "Finance Cell",
      details: "BVI registered entity receiving wire transfers from Vikas Verma."
    },
    {
      id: "ORG003",
      type: "ORGANIZATION",
      name: "Shadow Security Services",
      confidence: 0.89,
      role: "Enforcement Wing",
      registration: "SEC-2023-112",
      status: "Active",
      cell: "Operations Cell",
      details: "Private security firm providing physical protection for safehouses."
    },

    // PHONES
    {
      id: "PH001",
      type: "PHONE",
      name: "+91 9999888777",
      confidence: 0.98,
      carrier: "Airtel Secret Line",
      details: "Encrypted burner device active near Rahul Saxena's primary residence."
    },
    {
      id: "PH023",
      type: "PHONE",
      name: "9876543210",
      confidence: 0.99,
      carrier: "Jio Secure",
      details: "Registered under alias R. Sharma. Used for high-frequency coordination."
    },
    {
      id: "PH003",
      type: "PHONE",
      name: "+91 9811223344",
      confidence: 0.95,
      carrier: "Vi Business",
      details: "Tapped line active during interstate drug shipments."
    },

    // VEHICLES
    {
      id: "VEH001",
      type: "VEHICLE",
      name: "PB10AB1234 (Black SUV)",
      confidence: 0.94,
      model: "Black SUV (Fortuner)",
      owner: "P002",
      details: "Spotted at Safehouse B-42 during nocturnal meetings."
    },
    {
      id: "VEH002",
      type: "VEHICLE",
      name: "DL3CC8899 (Cargo Truck)",
      confidence: 0.90,
      model: "Commercial Cargo Truck",
      owner: "P003",
      details: "Custom false-bottom cargo truck used for concealed transport."
    },

    // LOCATIONS
    {
      id: "LOC001",
      type: "LOCATION",
      name: "Safehouse B-42 (Manali)",
      confidence: 0.97,
      category: "Command Base",
      coordinates: "32.2432° N, 77.1892° E",
      details: "Secluded property identified as syndicate hub during surveillance."
    },
    {
      id: "LOC017",
      type: "LOCATION",
      name: "Sector 17",
      confidence: 0.94,
      category: "Drop Zone",
      coordinates: "30.7415° N, 76.7791° E",
      details: "Public commercial center used for quick handovers."
    },
    {
      id: "LOC009",
      type: "LOCATION",
      name: "Warehouse 9 (Port Enclave)",
      confidence: 0.91,
      category: "Storage",
      coordinates: "18.9438° N, 72.8359° E",
      details: "Leased by Global Apex Trading. Primary customs storage."
    },

    // BANK ACCOUNTS
    {
      id: "BNK001",
      type: "BANK_ACCOUNT",
      name: "ACC-99812 (Swiss Union Bank)",
      confidence: 0.99,
      bank: "Swiss Union Bank",
      holder: "P004",
      details: "High-value destination account receiving layered transfers."
    },
    {
      id: "BNK002",
      type: "BANK_ACCOUNT",
      name: "ACC-44102 (HDFC Corporate)",
      confidence: 0.96,
      bank: "HDFC Commercial",
      holder: "ORG001",
      details: "Corporate account flagged for anomalous ₹9,500,000 deposit."
    },
    {
      id: "BNK003",
      type: "BANK_ACCOUNT",
      name: "ACC-77631 (ICICI Private)",
      confidence: 0.92,
      bank: "ICICI Private",
      holder: "P006",
      details: "Multiple small daily deposits consolidating into Hawala disbursements."
    },

    // CASES
    {
      id: "CASE001",
      type: "CASE",
      name: "FIR-2026/089 (Narcotics Seizure)",
      confidence: 0.99,
      title: "Narcotics Seizure & Trafficking",
      status: "Active Investigation",
      date: "2026-08-12",
      details: "Seizure of 45kg contraband near Manali checkpoint."
    },
    {
      id: "CASE002",
      type: "CASE",
      name: "FIR-2026/104 (Hawala Racket)",
      confidence: 0.98,
      title: "Hawala & Money Laundering Racket",
      status: "Under Prosecution",
      date: "2026-08-20",
      details: "Uncovered multi-state money laundering ring linked to Global Apex."
    }
  ],

  relationships: [
    { source: "P001", relation: "MET", target: "P002", confidence: 0.93 },
    { source: "P001", relation: "USED", target: "PH023", confidence: 0.98 },
    { source: "P001", relation: "USES", target: "PH001", confidence: 0.96 },
    { source: "P002", relation: "USES", target: "PH023", confidence: 0.97 },
    { source: "P003", relation: "USES", target: "PH003", confidence: 0.94 },
    { source: "P001", relation: "CALLS", target: "P002", confidence: 0.96 },
    { source: "P002", relation: "CALLS", target: "P003", confidence: 0.91 },
    { source: "P003", relation: "CALLS", target: "P005", confidence: 0.88 },
    { source: "P001", relation: "CALLS", target: "P007", confidence: 0.85 },
    { source: "P002", relation: "OWNS", target: "VEH001", confidence: 0.95 },
    { source: "P003", relation: "USES", target: "VEH002", confidence: 0.92 },
    { source: "P002", relation: "VISITED", target: "LOC001", confidence: 0.94 },
    { source: "P003", relation: "VISITED", target: "LOC001", confidence: 0.91 },
    { source: "P005", relation: "VISITED", target: "LOC017", confidence: 0.89 },
    { source: "VEH002", relation: "VISITED", target: "LOC009", confidence: 0.87 },
    { source: "P004", relation: "CONNECTED_TO", target: "ORG001", confidence: 0.97 },
    { source: "P001", relation: "CONNECTED_TO", target: "ORG002", confidence: 0.96 },
    { source: "P004", relation: "CONNECTED_TO", target: "BNK001", confidence: 0.98 },
    { source: "ORG001", relation: "CONNECTED_TO", target: "BNK002", confidence: 0.95 },
    { source: "P006", relation: "CONNECTED_TO", target: "BNK003", confidence: 0.94 },
    { source: "BNK002", relation: "TRANSFERRED_MONEY", target: "BNK001", confidence: 0.99 },
    { source: "BNK001", relation: "TRANSFERRED_MONEY", target: "BNK003", confidence: 0.97 },
    { source: "P002", relation: "TRANSFERRED_MONEY", target: "P004", confidence: 0.89 },
    { source: "P002", relation: "MENTIONED_IN", target: "CASE001", confidence: 0.98 },
    { source: "P003", relation: "MENTIONED_IN", target: "CASE001", confidence: 0.99 },
    { source: "P004", relation: "MENTIONED_IN", target: "CASE002", confidence: 0.97 },
    { source: "P006", relation: "MENTIONED_IN", target: "CASE002", confidence: 0.95 }
  ],

  events: [
    {
      eventId: "EV001",
      type: "MEETING",
      date: "2026-08-12",
      location: "LOC017",
      participants: ["P001", "P002"]
    },
    {
      eventId: "EV002",
      type: "ACCOUNT_OPENED",
      date: "2026-08-01",
      location: "LOC017",
      participants: ["P004"]
    },
    {
      eventId: "EV003",
      type: "SURVEILLANCE_SIGHTING",
      date: "2026-08-10",
      location: "LOC001",
      participants: ["P002", "P003"]
    },
    {
      eventId: "EV004",
      type: "CALL_SPIKE",
      date: "2026-08-11",
      location: "LOC001",
      participants: ["P001", "P002"]
    },
    {
      eventId: "EV005",
      type: "CHECKPOINT_INTERCEPT",
      date: "2026-08-12",
      location: "LOC001",
      participants: ["P002", "P003"]
    },
    {
      eventId: "EV006",
      type: "WIRE_TRANSFER",
      date: "2026-08-18",
      location: "LOC009",
      participants: ["P004", "P006"]
    },
    {
      eventId: "EV007",
      type: "PROBE_INITIATED",
      date: "2026-08-20",
      location: "LOC017",
      participants: ["P001", "P004", "P006"]
    }
  ]
};

// Stateful Mock File Repository Store (Empty by default)
export let mockFileStore = [];

// Helper to simulate live backend data update (Requirement #3)
export function simulateMockBackendUpdate() {
  const updateId = Date.now().toString().slice(-4);
  const newPersonId = `P${updateId}`;
  const newPhoneId = `PH${updateId}`;
  const newLocId = `LOC${updateId}`;
  const newEventId = `EV${updateId}`;

  const newEntities = [
    {
      id: newPersonId,
      type: "PERSON",
      name: `Karan Malhotra ${updateId}`,
      confidence: 0.93,
      role: "Newly Discovered Sub-broker",
      status: "Under Surveillance",
      cell: "Operations Cell",
      details: "Newly identified suspect detected through real-time CDR analysis."
    },
    {
      id: newPhoneId,
      type: "PHONE",
      name: `+91 98200${updateId}`,
      confidence: 0.97,
      carrier: "Encrypted Satellite Mobile",
      details: "Tapped communications line active during midnight drops."
    },
    {
      id: newLocId,
      type: "LOCATION",
      name: `Hideout Alpha-${updateId}`,
      confidence: 0.91,
      category: "Safehouse",
      coordinates: "31.1048° N, 77.1734° E",
      details: "Remote mountain cabin linked to recent suspect movements."
    }
  ];

  const newRelationships = [
    {
      source: "P001",
      relation: "CALLS",
      target: newPersonId,
      confidence: 0.91
    },
    {
      source: newPersonId,
      relation: "USED",
      target: newPhoneId,
      confidence: 0.98
    },
    {
      source: newPersonId,
      relation: "VISITED",
      target: newLocId,
      confidence: 0.92
    },
    {
      source: newPersonId,
      relation: "MET",
      target: "P002",
      confidence: 0.89
    }
  ];

  const newEvent = {
    eventId: newEventId,
    type: "LIVE_INTERCEPT",
    date: new Date().toISOString().split('T')[0],
    location: newLocId,
    participants: [newPersonId, "P002"]
  };

  mockInvestigationStore = {
    entities: [...mockInvestigationStore.entities, ...newEntities],
    relationships: [...mockInvestigationStore.relationships, ...newRelationships],
    events: [...mockInvestigationStore.events, newEvent]
  };

  return mockInvestigationStore;
}
