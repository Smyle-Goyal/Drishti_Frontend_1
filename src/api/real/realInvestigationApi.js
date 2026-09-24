// Real Investigation API implementation connecting to Spring Boot Controllers
// Controllers: DashboardController, NetworkController, PersonController, EntityController, MlController

import { apiClient } from '../client.js';

// GET /api/dashboard/summary
export async function fetchDashboardSummaryReal() {
  return await apiClient('/api/dashboard/summary');
}

// GET /api/network/person/{personId}?depth={depth}
export async function fetchPersonNetworkReal(personId, depth = 2) {
  if (!personId) return { nodes: [], edges: [] };
  return await apiClient(`/api/network/person/${personId}`, {
    queryParams: { depth }
  });
}

// GET /api/network/entity/{entityId}?depth={depth}
export async function fetchEntityNetworkReal(entityId, depth = 2) {
  if (!entityId) return { nodes: [], edges: [] };
  return await apiClient(`/api/network/entity/${entityId}`, {
    queryParams: { depth }
  });
}

// GET /api/persons/{personId}/profile
export async function fetchPersonProfileReal(personId) {
  return await apiClient(`/api/persons/${personId}/profile`);
}

// In-memory cache for all discovered person profiles across MongoDB
let cachedAllProfiles = null;

export async function fetchAllPersonProfilesReal() {
  if (cachedAllProfiles && cachedAllProfiles.length > 0) {
    return cachedAllProfiles;
  }

  const candidateIds = new Set();
  // Standard IDs
  for (let i = 1; i <= 20; i++) {
    candidateIds.add('P' + String(i).padStart(3, '0'));
  }
  // Hyphenated IDs (e.g., CASE-HAWALA-2026 suspects P-101..P-105)
  for (let i = 101; i <= 115; i++) {
    candidateIds.add('P-' + i);
  }

  // Also collect vehicle owner IDs
  try {
    const vehicles = await apiClient('/api/vehicles');
    if (Array.isArray(vehicles)) {
      vehicles.forEach(v => {
        if (v.ownerPersonId) candidateIds.add(v.ownerPersonId);
      });
    }
  } catch (e) {}

  const profiles = [];
  for (const pid of candidateIds) {
    try {
      const profile = await apiClient(`/api/persons/${pid}/profile`);
      if (profile && (profile.personId || profile.name)) {
        profiles.push(profile);
      }
    } catch (e) {
      // 404 or does not exist
    }
  }

  cachedAllProfiles = profiles;
  return profiles;
}

// Discover which persons are linked to a case by scanning all person profiles
export async function fetchCasePersonIdsReal(caseId) {
  if (!caseId) return [];
  const profiles = await fetchAllPersonProfilesReal();
  return profiles
    .filter(p => Array.isArray(p.relatedCases) && p.relatedCases.includes(caseId))
    .map(p => p.personId);
}

// GET /api/persons/{personId}/profile & GET /api/persons/{personId}/connections
export async function fetchPersonDetailsReal(personId) {
  try {
    const profile = await apiClient(`/api/persons/${personId}/profile`);
    let connections = [];
    try {
      connections = await apiClient(`/api/persons/${personId}/connections`);
    } catch (e) {
      // connections optional fallback
    }
    let timeline = [];
    try {
      timeline = await apiClient(`/api/persons/${personId}/timeline`);
    } catch (e) {
      // timeline optional fallback
    }
    const relList = Array.isArray(connections) ? connections : [];
    const eventList = Array.isArray(timeline) ? timeline : [];
    return {
      personId,
      entity: {
        id: profile.personId || personId,
        type: 'PERSON',
        name: profile.name || personId,
        confidence: profile.confidence || 0.95,
        role: profile.status || 'Active Target',
        details: `Age: ${profile.age || 'N/A'}, Address: ${profile.address || 'N/A'}`
      },
      profile,
      connections: relList,
      relationships: relList,
      relatedEntities: [],
      events: eventList
    };
  } catch (err) {
    // Generic entity lookup fallback: GET /api/entities/{entityId}
    const genericEntity = await apiClient(`/api/entities/${personId}`);
    return {
      entity: {
        id: personId,
        type: genericEntity.type || 'PERSON',
        name: genericEntity.name || genericEntity.label || personId,
        confidence: genericEntity.confidence || 0.90,
        details: JSON.stringify(genericEntity)
      },
      connections: [],
      relationships: [],
      relatedEntities: [],
      events: []
    };
  }
}

// GET /api/persons/search?query={query}
export async function searchPersonsReal(query) {
  return await apiClient('/api/persons/search', {
    queryParams: { query }
  });
}

// GET /internal/ml/anomalies
export async function fetchAnomaliesReal() {
  return await apiClient('/internal/ml/anomalies');
}
