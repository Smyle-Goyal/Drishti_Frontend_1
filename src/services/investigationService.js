// Investigation Service Abstraction
// Routes requests to Real API or Mock API based on API_MODE config

import { API_MODE } from '../api/config.js';
import { apiClient } from '../api/client.js';
// import { 
//   fetchInvestigationData as fetchMockData, 
//   fetchEntityDetails as fetchMockEntityDetails,
//   triggerLiveBackendUpdate as triggerMockLiveUpdate
// } from '../api/mock/mockInvestigationApi.js';

import { 
  fetchDashboardSummaryReal,
  fetchPersonNetworkReal, 
  fetchEntityNetworkReal,
  fetchPersonDetailsReal,
  fetchCasePersonIdsReal,
  searchPersonsReal
} from '../api/real/realInvestigationApi.js';

// In-memory registry for newly uploaded document NLP results
const liveUploadedNlpStore = new Map();

export function registerUploadedNlpResult(caseId, nlpResult) {
  if (!caseId || !nlpResult) return;
  if (!liveUploadedNlpStore.has(caseId)) {
    liveUploadedNlpStore.set(caseId, []);
  }
  liveUploadedNlpStore.get(caseId).push(nlpResult);
}

export async function getInvestigationData(options = {}) {
  if (API_MODE === 'real') {
    const caseId = options.caseId || options.entityId;

    // Step 1: Fetch the case entity node from backend
    let caseNetwork = { nodes: [], edges: [] };
    if (caseId) {
      try {
        caseNetwork = await fetchEntityNetworkReal(caseId, options.depth || 2);
      } catch (e) {
        console.warn('Could not fetch case entity network:', e.message);
      }
    }

    // Step 2: Discover which persons are linked to this case via relatedCases
    let linkedPersonIds = [];
    if (caseId) {
      try {
        linkedPersonIds = await fetchCasePersonIdsReal(caseId);
      } catch (e) {
        console.warn('Could not discover case persons:', e.message);
      }
    }

    // Step 2b: Also fetch surveillance logs for this case (e.g., CASE-HAWALA-2026)
    let surveillanceNodes = [];
    let surveillanceEdges = [];
    if (caseId) {
      try {
        const surv = await fetchEntityNetworkReal(caseId).catch(() => null);
        const survList = await apiClient(`/api/cases/${caseId}/surveillance`).catch(() => []);
        if (Array.isArray(survList) && survList.length > 0) {
          survList.forEach(s => {
            if (s.personId && !linkedPersonIds.includes(s.personId)) {
              linkedPersonIds.push(s.personId);
            }
            if (s.vehicleId) {
              surveillanceNodes.push({
                id: s.vehicleId,
                type: 'VEHICLE',
                name: s.vehicleId,
                confidence: 0.95
              });
              if (s.personId) {
                surveillanceEdges.push({
                  source: s.personId,
                  relation: 'SPOTTED_IN',
                  target: s.vehicleId,
                  confidence: 0.95
                });
              }
            }
            if (s.locationId) {
              surveillanceNodes.push({
                id: s.locationId,
                type: 'LOCATION',
                name: s.locationId,
                confidence: 0.90
              });
              if (s.personId) {
                surveillanceEdges.push({
                  source: s.personId,
                  relation: 'VISITED',
                  target: s.locationId,
                  confidence: 0.92
                });
              }
            }
          });
        }
      } catch (e) {}
    }

    // Step 2c: Fetch extracted evidence and NLP entities for this case: GET /api/cases/{caseId}/evidence
    let evidenceNodes = [];
    let evidenceEdges = [];
    if (caseId) {
      try {
        const evidList = await apiClient(`/api/cases/${caseId}/evidence`).catch(() => []);
        if (Array.isArray(evidList) && evidList.length > 0) {
          evidList.forEach(ev => {
            const cleanName = (ev.sourceSpanText || ev.description || '').replace(/\s+/g, ' ').trim();
            if (!cleanName) return;
            const normId = 'EXT_' + cleanName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
            
            let eType = 'PERSON';
            const desc = (ev.description || '').toLowerCase();
            if (desc.includes('account') || desc.includes('bank')) eType = 'ACCOUNT';
            else if (desc.includes('phone') || desc.includes('mobile')) eType = 'PHONE';
            else if (desc.includes('vehicle') || desc.includes('car')) eType = 'VEHICLE';
            else if (desc.includes('location') || desc.includes('address')) eType = 'LOCATION';
            else if (desc.includes('org') || desc.includes('company')) eType = 'ORGANIZATION';

            evidenceNodes.push({
              id: normId,
              type: eType,
              name: cleanName,
              confidence: 0.92
            });

            if (ev.sourceDocumentId) {
              evidenceNodes.push({
                id: ev.sourceDocumentId,
                type: 'DOCUMENT',
                name: ev.sourceDocumentId,
                confidence: 0.98
              });
              evidenceEdges.push({
                source: normId,
                relation: 'EXTRACTED_FROM',
                target: ev.sourceDocumentId,
                confidence: 0.95
              });
              evidenceEdges.push({
                source: ev.sourceDocumentId,
                relation: 'ATTACHED_TO',
                target: caseId,
                confidence: 0.98
              });
            } else {
              evidenceEdges.push({
                source: normId,
                relation: 'MENTIONED_IN',
                target: caseId,
                confidence: 0.92
              });
            }
          });
        }
      } catch (e) {}

      // Step 2d: Merge live in-memory uploaded document NLP results
      const liveList = liveUploadedNlpStore.get(caseId) || [];
      liveList.forEach(live => {
        const docId = live.documentId || `DOC_UPLOAD_${Date.now()}`;
        evidenceNodes.push({
          id: docId,
          type: 'DOCUMENT',
          name: docId,
          confidence: 0.99
        });
        evidenceEdges.push({
          source: docId,
          relation: 'ATTACHED_TO',
          target: caseId,
          confidence: 0.99
        });

        (live.entities || []).forEach(ent => {
          const eName = ent.mention || ent.name || ent.canonicalId;
          if (!eName) return;
          const eId = ent.canonicalId || ('EXT_' + eName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase());
          evidenceNodes.push({
            id: eId,
            type: ent.type || 'PERSON',
            name: eName,
            confidence: ent.confidence || 0.95
          });
          evidenceEdges.push({
            source: eId,
            relation: 'EXTRACTED_FROM',
            target: docId,
            confidence: ent.confidence || 0.95
          });
        });

        (live.relationships || []).forEach(rel => {
          if (rel.sourceId && rel.targetId) {
            evidenceEdges.push({
              source: rel.sourceId,
              relation: rel.relation || 'CONNECTED_TO',
              target: rel.targetId,
              confidence: rel.confidence || 0.90
            });
          }
        });
      });
    }

    // Step 3: If a specific personId was requested, include it
    if (options.personId && !linkedPersonIds.includes(options.personId)) {
      linkedPersonIds.push(options.personId);
    }

    // Step 4: Fetch person networks for each linked person
    const allPersonNetworks = [];
    for (const pId of linkedPersonIds) {
      try {
        const net = await fetchPersonNetworkReal(pId, options.depth || 2);
        allPersonNetworks.push(net);
      } catch (e) {
        console.warn('Could not fetch person network for', pId, ':', e.message);
      }
    }

    // Step 5: Combine case network + all person networks + surveillance + evidence with deduplication
    const rawNodes = [...(caseNetwork.nodes || []), ...surveillanceNodes, ...evidenceNodes];
    const rawEdges = [...(caseNetwork.edges || []), ...surveillanceEdges, ...evidenceEdges];
    allPersonNetworks.forEach(net => {
      rawNodes.push(...(net.nodes || []));
      rawEdges.push(...(net.edges || []));
    });

    const nodeMap = new Map();
    rawNodes.forEach(n => {
      const item = n.data ? n.data : n;
      const id = item.id || item.entityId;
      if (id && !nodeMap.has(id)) {
        nodeMap.set(id, {
          id: id,
          type: item.type || item.entityType || (String(id).startsWith('CASE') ? 'CASE' : 'ENTITY'),
          name: item.label || item.name || item.title || id,
          confidence: item.confidence || 0.95
        });
      }
    });

    const edgeSet = new Set();
    const relationships = [];
    rawEdges.forEach(e => {
      const item = e.data ? e.data : e;
      const src = item.source || item.sourceId || item.from;
      const tgt = item.target || item.targetId || item.to;
      const rel = item.relation || item.relationship || item.label || 'CONNECTED_TO';
      const key = src + '_' + rel + '_' + tgt;
      if (src && tgt && !edgeSet.has(key)) {
        edgeSet.add(key);
        relationships.push({
          source: src,
          relation: rel,
          target: tgt,
          confidence: item.confidence || 0.90
        });
      }
    });

    // Step 6: Connect each linked person to the case node
    if (caseId && nodeMap.has(caseId)) {
      for (const pId of linkedPersonIds) {
        if (nodeMap.has(pId)) {
          const caseRelKey = pId + '_INVESTIGATED_IN_' + caseId;
          if (!edgeSet.has(caseRelKey)) {
            edgeSet.add(caseRelKey);
            relationships.push({
              source: pId,
              relation: 'INVESTIGATED_IN',
              target: caseId,
              confidence: 0.98
            });
          }
        }
      }
    }

    return {
      caseId,
      entities: Array.from(nodeMap.values()),
      relationships,
      events: []
    };
  }
  return await fetchMockData(options);
}

export async function getDashboardSummary() {
  if (API_MODE === 'real') {
    try {
      return await fetchDashboardSummaryReal();
    } catch (err) {
      console.warn("Real dashboard summary failed:", err.message);
    }
  }
  return {
    totalCases: 12,
    totalPersons: 42,
    totalVehicles: 18,
    totalPhones: 28,
    totalAccounts: 15,
    totalTransactions: 142,
    totalCalls: 380,
    totalRelationships: 68,
    totalAnomalies: 4
  };
}

export async function getEntityDetails(entityId) {
  if (API_MODE === 'real') {
    return await fetchPersonDetailsReal(entityId);
  }
  return await fetchMockEntityDetails(entityId);
}

export async function refreshBackendData(options = {}) {
  if (API_MODE === 'real') {
    return await getInvestigationData(options);
  }
  return await triggerMockLiveUpdate();
}

export async function searchEntities(query) {
  if (API_MODE === 'real') {
    try {
      return await searchPersonsReal(query);
    } catch (err) {
      console.warn("Real search failed:", err.message);
    }
  }
  return [];
}
