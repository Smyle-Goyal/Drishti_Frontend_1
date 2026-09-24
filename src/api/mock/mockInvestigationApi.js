// Mock Investigation API Handler
// Simulates asynchronous network delay & returns strict backend response contract:
// { entities: [], relationships: [], events: [] }

import { mockInvestigationStore, simulateMockBackendUpdate } from './mockDataStore.js';

export async function fetchInvestigationData(options = {}) {
  // Simulate network latency (250-500ms)
  await new Promise(resolve => setTimeout(resolve, options.delay || 300));

  if (options.shouldFail) {
    throw new Error("Failed to fetch investigation data from backend service API.");
  }

  if (options.isEmpty) {
    return {
      entities: [],
      relationships: [],
      events: []
    };
  }

  // Deep clone to prevent direct state mutation by consumers
  return JSON.parse(JSON.stringify(mockInvestigationStore));
}

export async function fetchEntityDetails(entityId) {
  await new Promise(resolve => setTimeout(resolve, 200));

  const store = mockInvestigationStore;
  const entity = store.entities.find(e => e.id === entityId);
  if (!entity) {
    throw new Error(`Entity with ID '${entityId}' not found.`);
  }

  // Find direct relationships
  const rels = store.relationships.filter(
    r => r.source === entityId || r.target === entityId
  );

  // Find related entities
  const relatedEntityIds = new Set();
  rels.forEach(r => {
    if (r.source !== entityId) relatedEntityIds.add(r.source);
    if (r.target !== entityId) relatedEntityIds.add(r.target);
  });

  const relatedEntities = store.entities.filter(e => relatedEntityIds.has(e.id));

  // Find relevant events
  const relevantEvents = store.events.filter(
    evt => evt.location === entityId || (evt.participants && evt.participants.includes(entityId))
  );

  return {
    entity: JSON.parse(JSON.stringify(entity)),
    relationships: JSON.parse(JSON.stringify(rels)),
    relatedEntities: JSON.parse(JSON.stringify(relatedEntities)),
    events: JSON.parse(JSON.stringify(relevantEvents))
  };
}

export async function triggerLiveBackendUpdate() {
  await new Promise(resolve => setTimeout(resolve, 400));
  const updatedData = simulateMockBackendUpdate();
  return JSON.parse(JSON.stringify(updatedData));
}
