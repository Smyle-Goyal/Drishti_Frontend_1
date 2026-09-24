// Real Timeline API Handler
// Controller: com.project.tekathon.drishti.controller.TimelineController

import { apiClient } from '../client.js';

// GET /api/cases/{caseId}/timeline
export async function fetchCaseTimelineReal(caseId) {
  if (!caseId) {
    throw new Error('Missing active case ID for timeline request.');
  }
  return await apiClient(`/api/cases/${caseId}/timeline`);
}

// GET /api/persons/{personId}/timeline
export async function fetchPersonTimelineReal(personId) {
  return await apiClient(`/api/persons/${personId}/timeline`);
}

// GET /api/entities/{entityId}/timeline
export async function fetchEntityTimelineReal(entityId) {
  return await apiClient(`/api/entities/${entityId}/timeline`);
}
