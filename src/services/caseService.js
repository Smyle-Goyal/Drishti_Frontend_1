// Case Service Abstraction
// Connects to Real CaseController (/api/cases)

import { fetchCasesReal, fetchCaseByIdReal } from '../api/real/realCaseApi.js';

export async function getCases() {
  const cases = await fetchCasesReal();
  if (!Array.isArray(cases)) {
    return [];
  }
  return cases.map(c => ({
    caseId: c.caseId || c.id,
    title: c.title || c.name || `Case ${c.caseId}`,
    status: c.status || 'ACTIVE',
    createdAt: c.createdAt || new Date().toISOString()
  }));
}

export async function getCaseById(caseId) {
  return await fetchCaseByIdReal(caseId);
}
