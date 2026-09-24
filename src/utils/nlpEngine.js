// AI Entity Extraction & Relationship Parser Engine for Drishti

/**
 * Extracts named entities (People, Phones, Vehicles, Locations, Amounts) from raw unstructured crime reports
 */
export function extractEntitiesFromText(text) {
  if (!text) return { persons: [], phones: [], vehicles: [], locations: [], orgs: [], amounts: [] };

  // Regex rules for Indian law enforcement entity recognition
  const phoneRegex = /(\+?\d{2}[\s-]?)?(\d{10}|\d{5}[\s-]\d{5})/g;
  const vehicleRegex = /([A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,2}\s?\d{4})/g; // e.g. PB10AB1234, DL3CC8899
  const amountRegex = /(₹|Rs\.?|INR)\s?(\d{1,3}(,\d{2,3})*|\d+)/gi;

  // Keyword-based entity lookup for demo/synthetic data matching
  const knownPersons = ["Rohit Sharma", "Sandeep Kumar", "Vikas Verma", "Aman Kapoor", "Rahul Saxena", "Priya Malhotra", "David Vance", "Kabir"];
  const knownLocations = ["Safehouse B-42", "Sector 17", "Manali", "Warehouse 9", "Port Enclave", "Chandigarh"];
  const knownOrgs = ["Global Apex Trading", "Shell Capital Corp", "Shadow Security Services", "CyberLogistics"];

  const foundPhones = Array.from(new Set(text.match(phoneRegex) || []));
  const foundVehicles = Array.from(new Set(text.match(vehicleRegex) || []));
  const foundAmounts = Array.from(new Set(text.match(amountRegex) || []));

  const foundPersons = knownPersons.filter(name => text.toLowerCase().includes(name.toLowerCase()));
  const foundLocations = knownLocations.filter(loc => text.toLowerCase().includes(loc.toLowerCase()));
  const foundOrgs = knownOrgs.filter(org => text.toLowerCase().includes(org.toLowerCase()));

  return {
    persons: foundPersons,
    phones: foundPhones,
    vehicles: foundVehicles,
    locations: foundLocations,
    orgs: foundOrgs,
    amounts: foundAmounts
  };
}

/**
 * Extracts directional relationships between extracted entities
 */
export function extractRelationshipsFromText(text, entities) {
  const relationships = [];
  const lowerText = text.toLowerCase();

  // Rule 1: Call relationships
  if (lowerText.includes("call") || lowerText.includes("phone") || lowerText.includes("contacted")) {
    if (entities.persons.length >= 2) {
      relationships.push({
        from: entities.persons[0],
        to: entities.persons[1],
        type: "CALLS",
        label: "CALLS / COMMUNICATES",
        evidence: "Mentioned call interaction in text"
      });
    }
  }

  // Rule 2: Vehicle ownership / usage
  if (entities.persons.length > 0 && entities.vehicles.length > 0) {
    relationships.push({
      from: entities.persons[0],
      to: entities.vehicles[0],
      type: "USES",
      label: "USES / OPERATES",
      evidence: `Spotted with vehicle ${entities.vehicles[0]}`
    });
  }

  // Rule 3: Location visits
  if (entities.persons.length > 0 && entities.locations.length > 0) {
    relationships.push({
      from: entities.persons[0],
      to: entities.locations[0],
      type: "VISITED",
      label: "VISITED / CO-LOCATED",
      evidence: `Spotted near location ${entities.locations[0]}`
    });
  }

  // Rule 4: Financial transfer
  if (entities.amounts.length > 0 && (entities.persons.length > 0 || entities.orgs.length > 0)) {
    const sender = entities.persons[0] || entities.orgs[0] || "Unknown Entity";
    const recipient = entities.persons[1] || entities.orgs[0] || "Target Account";
    relationships.push({
      from: sender,
      to: recipient,
      type: "TRANSFERRED_MONEY",
      label: `TRANSFERRED ${entities.amounts[0]}`,
      evidence: `Wire transfer of ${entities.amounts[0]} recorded`
    });
  }

  return relationships;
}
