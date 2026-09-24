// AI Agent Copilot Service
// Connects directly to the Agentic AI Backend (/agent/investigate)

import { queryAgentInvestigateReal } from '../api/real/realCopilotApi.js';

export async function queryCopilot(userQuery, options = {}) {
  const sessionId = options.sessionId || options.session_id || `SESSION_${Date.now()}`;
  const caseId = options.caseId || options.case_id || '';

  const res = await queryAgentInvestigateReal(userQuery, {
    sessionId,
    caseId
  });

  // Explicitly read text response from data.answer (not data.message) as per backend contract
  const answerText = (res && res.answer !== undefined && res.answer !== null) 
    ? String(res.answer) 
    : (typeof res === 'string' ? res : '');

  return {
    answer: answerText || 'Query processed.',
    findings: Array.isArray(res.findings) ? res.findings : [],
    evidence: Array.isArray(res.evidence) ? res.evidence : [],
    confidence: res.confidence !== undefined ? res.confidence : null,
    status: res.status || 'completed',
    sessionId: res.session_id || sessionId,
    caseId: res.case_id || caseId,
    rawResponse: res
  };
}
