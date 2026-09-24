// Real Case & Dossier Management API Handler
// Controller: com.project.tekathon.drishti.controller.CaseController

import { apiClient } from '../client.js';

// GET /api/cases
export async function fetchCasesReal() {
  return await apiClient('/api/cases');
}

// GET /api/cases/{caseId}
export async function fetchCaseByIdReal(caseId) {
  return await apiClient(`/api/cases/${caseId}`);
}
