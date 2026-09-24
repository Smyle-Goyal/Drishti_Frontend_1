// // Real AI Agent Copilot API Handler
// // Communicates directly with the Agentic AI Service (/agent/investigate)

// import { AGENT_API_BASE_URL } from '../config.js';

// export async function queryAgentInvestigateReal(query, options = {}) {
//   const sessionId = options.sessionId || options.session_id || `SESSION_${Date.now()}`;
//   const caseId = options.caseId || options.case_id || '';

//   const url = `${AGENT_API_BASE_URL}/agent/investigate`;
//   const requestBody = {
//     session_id: sessionId,
//     case_id: caseId,
//     query: query
//   };

//   const response = await fetch(url, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'ngrok-skip-browser-warning': 'true'
//     },
//     body: JSON.stringify(requestBody)
//   });

//   if (!response.ok) {
//     let errText = response.statusText;
//     try {
//       const errJson = await response.json();
//       errText = errJson.message || errJson.error || JSON.stringify(errJson);
//     } catch (e) {}
//     throw new Error(`Agent API Error (${response.status}): ${errText}`);
//   }

//   return await response.json();
// }






// Real AI Agent Copilot API Handler
// Communicates directly with the Agentic AI Service (/agent/investigate)

import { AGENT_API_BASE_URL } from '../config.js';

export async function queryAgentInvestigateReal(query, options = {}) {
  const sessionId = options.sessionId || options.session_id || `SESSION_${Date.now()}`;
  const caseId = options.caseId || options.case_id || 'CASE-HAWALA-2026'; // Fallback caseId if empty

  const url = `${AGENT_API_BASE_URL}/agent/investigate`;
  const requestBody = {
    session_id: sessionId,
    case_id: caseId,
    query: query
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(120000) // 120-second timeout for local Ollama AI generation
  });

  if (!response.ok) {
    let errText = response.statusText;
    try {
      const errJson = await response.json();
      errText = errJson.message || errJson.error || JSON.stringify(errJson);
    } catch (e) {}
    throw new Error(`Agent API Error (${response.status}): ${errText}`);
  }

  const data = await response.json();

  // Note for UI rendering:
  // data.answer -> Main AI Investigation Briefing text
  // data.findings -> Array of structured findings & suspect links
  // data.evidence -> Array of document citations (FIR-238, SR001, TXN001)
  // data.confidence -> Confidence rating (e.g. 0.9)
  
  return data;
}