import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { getInvestigationData, getEntityDetails, refreshBackendData } from '../services/investigationService';
import { getPersonHypothesis } from '../services/suspectService';
import { transformBackendToVisFormat } from '../utils/graphAdapter';

export default function DashboardPage({ searchQuery, onSelectTargetForAI, activeCase, lastDataRefresh }) {
  const activeCaseId = activeCase ? activeCase.caseId : null;
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  // Async API states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState({ entities: [], relationships: [], events: [] });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Inspector Panel State
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [entityDetails, setEntityDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [inspectorHypothesis, setInspectorHypothesis] = useState(null);
  const [loadingHypothesis, setLoadingHypothesis] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState('ALL');

  // Load API Data on Mount and when activeCaseId changes
  const loadData = async (targetCaseId) => {
    const cId = targetCaseId || activeCaseId;
    setLoading(true);
    setError(null);
    try {
      const res = await getInvestigationData({ caseId: cId });
      setApiResponse(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch investigation data from API service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeCaseId);
  }, [activeCaseId, lastDataRefresh]);

  const handleSimulateRefresh = async () => {
    setIsRefreshing(true);
    try {
      const updated = await refreshBackendData({ caseId: activeCaseId });
      setApiResponse(updated);
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Transform backend API contract to graph library nodes & edges via Adapter
  const { nodes, edges } = transformBackendToVisFormat(apiResponse.entities, apiResponse.relationships);

  // Filter nodes based on type and active search query
  const filteredNodes = nodes.filter(n => {
    const matchesType = filterType === 'ALL' || n.type === filterType;
    const q = (searchQuery || '').toLowerCase().trim();
    const matchesSearch = !q || 
      n.label.toLowerCase().includes(q) || 
      n.id.toLowerCase().includes(q) || 
      n.type.toLowerCase().includes(q) ||
      (n.aliases && n.aliases.some(a => a.toLowerCase().includes(q)));
    return matchesType && matchesSearch;
  });

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = edges.filter(e => filteredNodeIds.has(e.from) && filteredNodeIds.has(e.to));

// Helper to resolve Material Symbols icon for any entity type
function getEntityMaterialIcon(type) {
  const t = String(type || '').toUpperCase();
  switch (t) {
    case 'PERSON':
      return 'person';
    case 'PHONE':
    case 'CALL':
    case 'COMMUNICATION':
    case 'MOBILE':
      return 'smartphone';
    case 'VEHICLE':
    case 'CAR':
    case 'AUTOMOBILE':
      return 'directions_car';
    case 'LOCATION':
    case 'ADDRESS':
    case 'PLACE':
      return 'pin_drop';
    case 'ORGANIZATION':
    case 'COMPANY':
    case 'CORP':
      return 'corporate_fare';
    case 'BANK_ACCOUNT':
    case 'ACCOUNT':
    case 'FINANCIAL':
    case 'BANK':
      return 'account_balance';
    case 'CASE':
    case 'FIR':
      return 'policy';
    case 'DOCUMENT':
    case 'EVIDENCE':
      return 'description';
    default:
      return 'folder';
  }
}

// Helper to generate SVG icon badges matching the Stitch Criminal Network Graph
function getEntitySvgIcon(type, riskScore = 50) {
  const t = String(type || '').toUpperCase();
  let bg = '#521526';
  let border = '#d8c1c4';
  let iconColor = '#ffffff';

  const risk = Number(riskScore) || 50;

  if (t === 'PERSON') {
    if (risk >= 80) {
      bg = '#521526';
      border = '#ba1a1a';
      iconColor = '#ffffff';
    } else if (risk >= 50) {
      bg = '#6F1D32';
      border = '#d8c1c4';
      iconColor = '#ffffff';
    } else {
      bg = '#85223c';
      border = '#d8c1c4';
      iconColor = '#ffffff';
    }
  } else if (t === 'PHONE' || t === 'CALL' || t === 'COMMUNICATION' || t === 'MOBILE') {
    bg = '#2A2E33';
    border = '#66758A';
    iconColor = '#ffffff';
  } else if (t === 'VEHICLE' || t === 'CAR' || t === 'AUTOMOBILE') {
    bg = '#36342E';
    border = '#9A7650';
    iconColor = '#ffffff';
  } else if (t === 'ORGANIZATION' || t === 'COMPANY' || t === 'CORP') {
    bg = '#3B2A22';
    border = '#D18025';
    iconColor = '#ffdcbf';
  } else if (t === 'LOCATION' || t === 'ADDRESS' || t === 'PLACE') {
    bg = '#1F2E2B';
    border = '#5F7774';
    iconColor = '#ffffff';
  } else if (t === 'BANK_ACCOUNT' || t === 'ACCOUNT' || t === 'FINANCIAL' || t === 'BANK') {
    bg = '#361818';
    border = '#BA1A1A';
    iconColor = '#ffffff';
  } else if (t === 'CASE' || t === 'FIR') {
    bg = '#381622';
    border = '#8B4053';
    iconColor = '#ffffff';
  } else if (t === 'DOCUMENT' || t === 'EVIDENCE') {
    bg = '#292B30';
    border = '#756E69';
    iconColor = '#ffffff';
  } else {
    bg = '#360112';
    border = '#d8c1c4';
    iconColor = '#ffffff';
  }

  let iconPath = '';
  switch (t) {
    case 'PERSON':
      iconPath = `<circle cx="20" cy="13.5" r="4.5" fill="${iconColor}"/><path d="M10.5 28.5c0-4.5 4.2-7.5 9.5-7.5s9.5 3 9.5 7.5" fill="${iconColor}"/>`;
      break;
    case 'PHONE':
    case 'CALL':
    case 'COMMUNICATION':
    case 'MOBILE':
      // Mobile Smartphone icon with screen, notch, and home bar
      iconPath = `<rect x="13" y="8.5" width="14" height="23" rx="3" fill="none" stroke="${iconColor}" stroke-width="2"/><rect x="15.5" y="12.5" width="9" height="12.5" rx="1" fill="${iconColor}" fill-opacity="0.3"/><line x1="18" y1="10.5" x2="22" y2="10.5" stroke="${iconColor}" stroke-width="1.5" stroke-linecap="round"/><circle cx="20" cy="28" r="1.2" fill="${iconColor}"/>`;
      break;
    case 'VEHICLE':
    case 'CAR':
    case 'AUTOMOBILE':
      // Automobile Vehicle icon with chassis, roofline, windows and headlights
      iconPath = `<path d="M9 22.5l2.2-5.8c.4-1 1.4-1.7 2.5-1.7h12.6c1.1 0 2.1.7 2.5 1.7l2.2 5.8v6a1.5 1.5 0 0 1-1.5 1.5H28a1.5 1.5 0 0 1-1.5-1.5V27h-13v1.5a1.5 1.5 0 0 1-1.5 1.5h-1.5A1.5 1.5 0 0 1 9 28.5v-6z" fill="${iconColor}"/><path d="M12.5 17.5l-1.3 3.5h17.6l-1.3-3.5c-.2-.6-.8-1-1.5-1H14c-.7 0-1.3.4-1.5 1z" fill="${bg}"/><circle cx="12.5" cy="24" r="1.5" fill="${border}"/><circle cx="27.5" cy="24" r="1.5" fill="${border}"/>`;
      break;
    case 'ORGANIZATION':
    case 'COMPANY':
    case 'CORP':
      // Corporate headquarters building
      iconPath = `<path d="M11 31V9.5a1.5 1.5 0 0 1 1.5-1.5h15a1.5 1.5 0 0 1 1.5 1.5V31M9 31h22" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round"/><rect x="14" y="12" width="3" height="3" fill="${iconColor}"/><rect x="23" y="12" width="3" height="3" fill="${iconColor}"/><rect x="14" y="17" width="3" height="3" fill="${iconColor}"/><rect x="23" y="17" width="3" height="3" fill="${iconColor}"/><rect x="14" y="22" width="3" height="3" fill="${iconColor}"/><rect x="23" y="22" width="3" height="3" fill="${iconColor}"/><rect x="18" y="26" width="4" height="5" fill="${iconColor}"/>`;
      break;
    case 'LOCATION':
    case 'ADDRESS':
    case 'PLACE':
      // Map location pin drop
      iconPath = `<path d="M20 8.5c-4.4 0-8 3.6-8 8 0 5.8 8 15.5 8 15.5s8-9.7 8-15.5c0-4.4-3.6-8-8-8zm0 10.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="${iconColor}"/>`;
      break;
    case 'BANK_ACCOUNT':
    case 'ACCOUNT':
    case 'FINANCIAL':
    case 'BANK':
      // Treasury bank building with pillars
      iconPath = `<path d="M9 13.5l11-5 11 5v2H9v-2z" fill="${iconColor}"/><rect x="11" y="17.5" width="2.8" height="9" rx="0.5" fill="${iconColor}"/><rect x="16" y="17.5" width="2.8" height="9" rx="0.5" fill="${iconColor}"/><rect x="21.2" y="17.5" width="2.8" height="9" rx="0.5" fill="${iconColor}"/><rect x="26.2" y="17.5" width="2.8" height="9" rx="0.5" fill="${iconColor}"/><rect x="9" y="28" width="22" height="3" rx="0.5" fill="${iconColor}"/>`;
      break;
    case 'CASE':
    case 'FIR':
      // Police investigation shield badge
      iconPath = `<path d="M20 8l9 3.5v7c0 5.5-3.8 10.6-9 12.5-5.2-1.9-9-7-9-12.5v-7L20 8z" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linejoin="round"/><path d="M20 12.5l1.4 3.2h3.4l-2.7 2.1 1 3.2-3.1-2-3.1 2 1-3.2-2.7-2.1h3.4L20 12.5z" fill="${iconColor}"/>`;
      break;
    case 'DOCUMENT':
    case 'EVIDENCE':
      // Evidence file sheet with folded corner
      iconPath = `<path d="M12 9a2 2 0 0 1 2-2h8l6 6v16a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V9z" fill="none" stroke="${iconColor}" stroke-width="2"/><path d="M22 7v6h6" fill="none" stroke="${iconColor}" stroke-width="2"/><line x1="16" y1="18" x2="24" y2="18" stroke="${iconColor}" stroke-width="1.8" stroke-linecap="round"/><line x1="16" y1="22" x2="24" y2="22" stroke="${iconColor}" stroke-width="1.8" stroke-linecap="round"/>`;
      break;
    default:
      // General intelligence folder
      iconPath = `<path d="M9 13a2 2 0 0 1 2-2h5l2 2h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V13z" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round"/>`;
      break;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="${bg}" stroke="${border}" stroke-width="2.5"/>${iconPath}</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// Helper to extract a compact, readable label for clean node presentation without truncating crucial entity names
function getCompactLabel(rawLabel) {
  if (!rawLabel) return '';
  const str = String(rawLabel).trim();

  // If short enough (up to 20 characters), preserve it completely!
  // e.g., "Rahul Saxena", "State of Maharashtra", "Global Apex", "Rohit Sharma", "PB10AB1234"
  if (str.length <= 20) {
    return str;
  }

  // If contains parentheses like "PB10AB1234 (Armored G-Wagen Sprinter)" -> "PB10AB1234"
  if (str.includes('(') && str.indexOf('(') > 0) {
    const beforeParen = str.split('(')[0].trim();
    if (beforeParen.length > 0 && beforeParen.length <= 20) {
      return beforeParen;
    }
  }

  // If phone number (e.g. +91 98201 44821 or 9999888777)
  if (str.startsWith('+') || /^[0-9\s()-]{9,}$/.test(str)) {
    const cleanPhone = str.replace(/^\+\d{1,3}\s*/, '').trim();
    if (cleanPhone.length <= 16) return cleanPhone;
    const phonePart = cleanPhone.split(/[\s-]/)[0];
    if (phonePart && phonePart.length >= 4) return phonePart;
  }

  // If address like "Sector 17 Safehouse Gurgaon Sector 17" -> "Sector 17 Safehouse"
  if (/^Sector\s+\d+/i.test(str)) {
    const secMatch = str.match(/^Sector\s+\d+(\s+[A-Za-z]+)?/i);
    if (secMatch) return secMatch[0];
  }

  // If legal case format with 'v.' or 'vs.' (e.g., 'K. M. Nanavati v. State of Maharashtra')
  if (/\b(?:v\.|vs\.?)\b/i.test(str)) {
    const parts = str.split(/\b(?:v\.|vs\.?)\b/i);
    if (parts.length >= 2) {
      const p1 = parts[0].trim();
      if (p1.length > 0 && p1.length <= 20) return p1;
    }
  }

  // For longer names, truncate cleanly at word boundary if possible
  if (str.length > 20) {
    const truncated = str.slice(0, 19);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 10) {
      return truncated.slice(0, lastSpace) + '…';
    }
    return str.slice(0, 18) + '…';
  }

  return str;
}

  // Reference to track dossier animation lifecycle
  const lastAnimatedCaseRef = useRef(null);
  const traversalStateRef = useRef({
    activeNodeId: null,
    activeEdge: null,
    isBacktracking: false
  });

  // Render Vis Network Graph Canvas
  useEffect(() => {
    if (!containerRef.current || loading || error || nodes.length === 0) return;

    // Check accessibility preference
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Only run DFS traversal animation on initial dossier load, NOT on search/filter typing
    const isNewCase = lastAnimatedCaseRef.current !== activeCaseId;
    const shouldAnimate = isNewCase && !prefersReducedMotion && !searchQuery && filterType === 'ALL';
    if (isNewCase) {
      lastAnimatedCaseRef.current = activeCaseId;
    }

    // Prepare full list of Vis node configurations
    const allNodeItems = filteredNodes.map(n => {
      const risk = n.computedRisk || n.riskScore || 50;
      const iconUrl = getEntitySvgIcon(n.type, risk);
      const size = n.type === 'PERSON' && risk >= 80 ? 26 : (n.type === 'PERSON' ? 22 : 19);
      const compactLabel = getCompactLabel(n.label);

      return {
        id: n.id,
        label: compactLabel,
        shape: 'image',
        image: iconUrl,
        size: size,
        font: { 
          color: '#1f1b18', 
          face: 'Space Grotesk', 
          size: 11,
          strokeWidth: 2,
          strokeColor: '#ffffff'
        },
        borderWidth: 2,
        title: `<strong>${n.label}</strong><br/>Type: ${n.type}<br/>ID: ${n.id}${risk ? `<br/>Risk Score: ${risk}%` : ''}`,
        chosen: {
          node: (values, id, selected, hovering) => {
            if (hovering || selected) {
              values.size = (values.size || size) * 1.3;
            }
          },
          label: (values, id, selected, hovering) => {
            if (hovering || selected) {
              values.size = 12;
              values.color = '#360112';
              values.strokeWidth = 3;
              values.strokeColor = '#ffffff';
            }
          }
        }
      };
    });

    // Prepare full list of Vis edge configurations
    const allEdgeItems = filteredEdges.map(e => ({
      id: e.id,
      from: e.from,
      to: e.to,
      label: e.label,
      font: { 
        color: '#534345', 
        face: 'Space Grotesk', 
        size: 9, 
        strokeWidth: 2, 
        strokeColor: '#ffffff' 
      },
      color: { 
        color: e.type === 'financial' ? '#d18025' : '#857275', 
        highlight: '#521526',
        hover: '#9c3f53'
      },
      width: e.type === 'financial' ? 2.2 : 1.2,
      dashes: e.type === 'financial' ? [5, 3] : false,
      arrows: { to: { enabled: true, scaleFactor: 0.6 } }
    }));

    const buildTimeouts = [];
    let animId;

    let visNodes;
    let visEdges;
    const addedNodeIds = new Set();
    const addedEdgeIds = new Set();
    const appearTimes = {};

    if (!shouldAnimate) {
      // Instant display for search, filters, or reduced-motion
      allNodeItems.forEach(n => {
        addedNodeIds.add(n.id);
        appearTimes[n.id] = 0;
      });
      allEdgeItems.forEach(e => addedEdgeIds.add(e.id));
      visNodes = new DataSet(allNodeItems);
      visEdges = new DataSet(allEdgeItems);
      traversalStateRef.current = { activeNodeId: null, activeEdge: null, isBacktracking: false };
    } else {
      // Start with empty dataset for DFS traversal
      visNodes = new DataSet([]);
      visEdges = new DataSet([]);
    }

    const options = {
      nodes: { borderWidth: 2, shadow: false },
      edges: { smooth: { type: 'continuous', roundness: 0.2 } },
      physics: {
        enabled: true,
        barnesHut: { gravitationalConstant: -2200, centralGravity: 0.25, springLength: 110 }
      },
      interaction: { hover: true, tooltipDelay: 80, zoomView: true }
    };

    const network = new Network(containerRef.current, { nodes: visNodes, edges: visEdges }, options);
    networkRef.current = network;

    // Safety helper: immediately commit all unadded nodes/edges if user interacts
    const flushBuildAnimation = () => {
      buildTimeouts.forEach(t => clearTimeout(t));
      buildTimeouts.length = 0;
      traversalStateRef.current = { activeNodeId: null, activeEdge: null, isBacktracking: false };

      const unaddedNodes = allNodeItems.filter(n => !addedNodeIds.has(n.id));
      if (unaddedNodes.length > 0) {
        unaddedNodes.forEach(n => {
          addedNodeIds.add(n.id);
          appearTimes[n.id] = Date.now() - 600;
        });
        visNodes.add(unaddedNodes);
      }

      // Ensure all sizes are at 100%
      allNodeItems.forEach(n => {
        try {
          visNodes.update({ id: n.id, size: n.size });
        } catch (e) {}
      });

      const unaddedEdges = allEdgeItems.filter(e => !addedEdgeIds.has(e.id));
      if (unaddedEdges.length > 0) {
        unaddedEdges.forEach(e => addedEdgeIds.add(e.id));
        visEdges.add(unaddedEdges);
      }

      network.redraw();
    };

    // Construct true DFS Traversal sequence from actual graph structure
    if (shouldAnimate && allNodeItems.length > 0) {
      const adj = {};
      allNodeItems.forEach(n => {
        adj[n.id] = [];
      });

      allEdgeItems.forEach(e => {
        if (adj[e.from] && adj[e.to]) {
          adj[e.from].push({ neighborId: e.to, edge: e });
          adj[e.to].push({ neighborId: e.from, edge: e });
        }
      });

      const visitedNodes = new Set();
      const visitedEdges = new Set();
      const dfsSteps = [];

      // Recursive DFS visitor
      const traverseDfs = (currId, parentId, viaEdge) => {
        visitedNodes.add(currId);

        // 1. Visit current node
        dfsSteps.push({
          type: 'DISCOVER_NODE',
          nodeId: currId,
          viaEdge: viaEdge || null,
          parentId: parentId || null
        });

        // 2. Explore unvisited neighbors along actual edges
        const neighbors = adj[currId] || [];
        for (const { neighborId, edge } of neighbors) {
          if (!visitedNodes.has(neighborId)) {
            visitedEdges.add(edge.id);

            // Step 3: Edge draws/reveals BEFORE destination node appears
            dfsSteps.push({
              type: 'TRAVERSE_EDGE',
              from: currId,
              to: neighborId,
              edge: edge
            });

            // Traverse deeper
            traverseDfs(neighborId, currId, edge);

            // Step 7: Visual backtrack when branch ends
            dfsSteps.push({
              type: 'BACKTRACK',
              from: neighborId,
              to: currId,
              edge: edge
            });
          }
        }
      };

      // Start traversal from root entity (first node in existing data order)
      for (const n of allNodeItems) {
        if (!visitedNodes.has(n.id)) {
          traverseDfs(n.id, null, null);
        }
      }

      // Add any remaining edges that connect already visited nodes (e.g. cross-edges/cycles)
      for (const e of allEdgeItems) {
        if (!visitedEdges.has(e.id)) {
          dfsSteps.push({
            type: 'CYCLE_EDGE',
            from: e.from,
            to: e.to,
            edge: e
          });
          visitedEdges.add(e.id);
        }
      }

      // Timing configuration: Sequential DFS traversal with ~0.8s discovery delay per node
      const NODE_HOLD_DURATION = 800;     // ~0.8 seconds pause on each discovered node
      const EDGE_TRAVERSE_DURATION = 350; // 350ms edge tracing towards next node
      const BACKTRACK_DURATION = 350;     // 350ms visual return to parent branch point
      const CYCLE_EDGE_DURATION = 250;    // 250ms cross-connection reveal

      let cumulativeDelay = 150; // Initial 150ms pause before starting

      // Schedule sequential DFS steps
      dfsSteps.forEach(step => {
        let stepDuration;
        if (step.type === 'DISCOVER_NODE') {
          stepDuration = NODE_HOLD_DURATION;
        } else if (step.type === 'TRAVERSE_EDGE') {
          stepDuration = EDGE_TRAVERSE_DURATION;
        } else if (step.type === 'BACKTRACK') {
          stepDuration = BACKTRACK_DURATION;
        } else {
          stepDuration = CYCLE_EDGE_DURATION;
        }

        const scheduledTime = cumulativeDelay;
        cumulativeDelay += stepDuration;

        const timer = setTimeout(() => {
          if (step.type === 'DISCOVER_NODE') {
            const nodeConfig = allNodeItems.find(n => n.id === step.nodeId);
            if (nodeConfig && !addedNodeIds.has(nodeConfig.id)) {
              addedNodeIds.add(nodeConfig.id);
              appearTimes[nodeConfig.id] = Date.now();

              // Node reveal: starts with scale(0.72)
              visNodes.add({
                ...nodeConfig,
                size: Math.max(12, Math.round(nodeConfig.size * 0.72))
              });

              // Scale smoothly to 1.0 (full size) over 350ms
              const scaleTimer = setTimeout(() => {
                try {
                  visNodes.update({ id: nodeConfig.id, size: nodeConfig.size });
                } catch (e) {}
              }, 350);
              buildTimeouts.push(scaleTimer);
            }

            // Set current node as active focus for the ~0.8 second discovery hold
            traversalStateRef.current = {
              activeNodeId: step.nodeId,
              activeEdge: null,
              isBacktracking: false
            };
          } else if (step.type === 'TRAVERSE_EDGE') {
            // Relationship edge activates and draws before destination node appears
            if (!addedEdgeIds.has(step.edge.id)) {
              addedEdgeIds.add(step.edge.id);
              visEdges.add(step.edge);
            }

            traversalStateRef.current = {
              activeNodeId: step.to,
              activeEdge: step.edge,
              isBacktracking: false
            };
          } else if (step.type === 'BACKTRACK') {
            // Visual backtrack: focus returns along the edge to the parent node
            traversalStateRef.current = {
              activeNodeId: step.to,
              activeEdge: step.edge,
              isBacktracking: true
            };
          } else if (step.type === 'CYCLE_EDGE') {
            if (!addedEdgeIds.has(step.edge.id)) {
              addedEdgeIds.add(step.edge.id);
              visEdges.add(step.edge);
            }
          }

          network.redraw();
        }, scheduledTime);

        buildTimeouts.push(timer);
      });

      // Completion step: clear traversal focus and ensure all elements are committed
      const completionTimer = setTimeout(() => {
        flushBuildAnimation();
      }, cumulativeDelay + 300);
      buildTimeouts.push(completionTimer);
    }

    // Continuous Animation & Overlay Loop
    const animateTraversalLoop = () => {
      network.redraw();
      animId = requestAnimationFrame(animateTraversalLoop);
    };

    network.on("afterDrawing", (ctx) => {
      const positions = network.getPositions();
      const time = Date.now() / 850;
      const pulsePhase = (Math.sin(time * Math.PI) + 1) / 2; // Smooth 0 to 1 breathing cycle
      const traversal = traversalStateRef.current;

      // 1. Active Traversal Edge Highlight & Travelling Tracer Beam
      if (traversal.activeEdge) {
        const fromPos = positions[traversal.activeEdge.from];
        const toPos = positions[traversal.activeEdge.to];
        if (fromPos && toPos) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(fromPos.x, fromPos.y);
          ctx.lineTo(toPos.x, toPos.y);
          ctx.strokeStyle = traversal.isBacktracking ? 'rgba(111, 29, 50, 0.45)' : '#6F1D32';
          ctx.lineWidth = traversal.isBacktracking ? 2.5 : 3.5;
          ctx.shadowColor = 'rgba(111, 29, 50, 0.55)';
          ctx.shadowBlur = 8;
          ctx.stroke();

          // Animated beam tracer along active traversal edge
          const edgeCycle = (Date.now() % 1000) / 1000;
          const tracerX = traversal.isBacktracking 
            ? toPos.x + (fromPos.x - toPos.x) * (1 - edgeCycle)
            : fromPos.x + (toPos.x - fromPos.x) * edgeCycle;
          const tracerY = traversal.isBacktracking 
            ? toPos.y + (fromPos.y - toPos.y) * (1 - edgeCycle)
            : fromPos.y + (toPos.y - fromPos.y) * edgeCycle;

          ctx.beginPath();
          ctx.arc(tracerX, tracerY, 4, 0, 2 * Math.PI);
          ctx.fillStyle = '#6F1D32';
          ctx.shadowColor = '#6F1D32';
          ctx.shadowBlur = 10;
          ctx.fill();

          ctx.restore();
        }
      }

      // 2. Active Traversal Focus Halo on Current Node (~5s Hold Emphasis)
      if (traversal.activeNodeId && positions[traversal.activeNodeId]) {
        const pos = positions[traversal.activeNodeId];
        const nodeObj = allNodeItems.find(n => n.id === traversal.activeNodeId);
        const radius = nodeObj ? nodeObj.size : 22;

        // Gentle breathing pulse for the active node focus ring
        const focusPulse = (Math.sin(time * 2 * Math.PI) + 1) / 2; // 0 to 1 cycle
        const focusRadius = radius + 4 + focusPulse * 3;

        ctx.save();
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, focusRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(111, 29, 50, ${(0.65 + focusPulse * 0.35).toFixed(2)})`;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(111, 29, 50, 0.6)';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
      }

      // 3. High-Risk Entity Alert Breathing & Pip (Step 9)
      filteredNodes.forEach(n => {
        const risk = Number(n.computedRisk || n.riskScore) || 50;
        if (risk >= 80 && positions[n.id] && addedNodeIds.has(n.id)) {
          const appearTime = appearTimes[n.id] || 0;
          const timeSinceAppear = appearTime === 0 ? 1000 : (Date.now() - appearTime);

          // Brief pause (300ms) after node appears before starting alert ring
          if (timeSinceAppear < 300) return;

          // Smooth fade-in of the alert pulse over the next 350ms
          const alertIntroFactor = Math.min(1, (timeSinceAppear - 300) / 350);

          const pos = positions[n.id];
          const nodeRadius = n.type === 'PERSON' ? 26 : 22;

          // Outer Expanding Alert Ring
          const ringRadius = nodeRadius + 3 + (pulsePhase * 9);
          const alpha = 0.6 * (1 - (pulsePhase * 0.7)) * alertIntroFactor;

          ctx.save();
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, ringRadius, 0, 2 * Math.PI, false);
          ctx.strokeStyle = `rgba(111, 29, 50, ${alpha.toFixed(2)})`; // Burgundy #6F1D32
          ctx.lineWidth = 2;
          ctx.stroke();

          // Alert Pip Indicator (◉) at top-right of the node
          const pipX = pos.x + (nodeRadius * 0.72);
          const pipY = pos.y - (nodeRadius * 0.72);
          ctx.beginPath();
          ctx.arc(pipX, pipY, 3.5, 0, 2 * Math.PI, false);
          ctx.fillStyle = `rgba(186, 26, 26, ${alertIntroFactor.toFixed(2)})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(255, 255, 255, ${alertIntroFactor.toFixed(2)})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.restore();
        }
      });
    });

    animId = requestAnimationFrame(animateTraversalLoop);

    network.on('selectNode', async (params) => {
      flushBuildAnimation(); // interrupt build animation so inspector opens immediately
      if (params.nodes.length > 0) {
        const id = params.nodes[0];
        setSelectedEntityId(id);
        setInspectorHypothesis(null);
        setDetailsLoading(true);
        try {
          const details = await getEntityDetails(id);
          setEntityDetails(details);
        } catch (err) {
          console.error("Error fetching details:", err);
        } finally {
          setDetailsLoading(false);
        }
      }
    });

    network.on('dragStart', () => {
      flushBuildAnimation(); // interrupt build if user begins pan/drag
    });

    network.on('deselectNode', () => {
      setSelectedEntityId(null);
      setEntityDetails(null);
      setInspectorHypothesis(null);
    });

    return () => {
      buildTimeouts.forEach(t => clearTimeout(t));
      if (animId) cancelAnimationFrame(animId);
      network.destroy();
    };
  }, [loading, error, filterType, searchQuery, nodes.length, edges.length]);

  // Handle auto-focus and auto-selection when user searches an exact ID/name
  useEffect(() => {
    if (!networkRef.current || !searchQuery) return;
    const q = searchQuery.toLowerCase().trim();
    const match = nodes.find(n => n.id.toLowerCase() === q || n.label.toLowerCase() === q);
    if (match) {
      networkRef.current.focus(match.id, { scale: 1.2, animation: true });
      networkRef.current.selectNodes([match.id]);
      setSelectedEntityId(match.id);
      getEntityDetails(match.id).then(details => setEntityDetails(details));
    }
  }, [searchQuery, nodes]);

  return (
    <div className="flex flex-row w-full h-[calc(100vh-3.5rem)] relative select-none font-['IBM_Plex_Sans'] overflow-hidden">
      {/* Primary Graph Workspace */}
      <div className="relative flex-1 h-full bg-[#0a100a] overflow-hidden flex flex-col">
        {/* Reticle Background Grid Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20" 
          style={{ backgroundImage: 'radial-gradient(circle, #8e928b 1px, transparent 1px)', backgroundSize: '28px 28px' }} 
        />

        {/* Top Overlay HUD Bar */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none gap-3">
          {/* Telemetry & Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto bg-[#171d17]/95 p-1.5 border border-[#444842]/30">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#0a100a] mr-1 border border-[#444842]/30">
              <span className="w-2 h-2 rounded-none bg-[#bccbb8] animate-pulse"></span>
              <span className="font-['Space_Grotesk'] text-[10px] text-[#bbccae] tracking-widest uppercase font-bold">
                GRAPH ENGINE: ACTIVE
              </span>
              <span className="text-[#444842] text-[10px]">|</span>
              <span className="font-['Space_Grotesk'] text-[10px] text-[#c4c8c0]">
                {filteredNodes.length} / {nodes.length} NODES
              </span>
            </div>

            <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#8e928b] px-1">FILTERS:</span>
            {['ALL', 'PERSON', 'ORGANIZATION', 'PHONE', 'VEHICLE', 'LOCATION', 'BANK_ACCOUNT', 'CASE'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-1 text-[10px] font-['Space_Grotesk'] uppercase transition-colors ${
                  filterType === type 
                    ? 'bg-[#354234] text-[#9fae9c] font-bold' 
                    : 'bg-[#1b211b] text-[#c4c8c0] hover:bg-[#252c25]'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 pointer-events-auto bg-[#171d17]/95 p-1.5 border border-[#444842]/30">
            <button
              onClick={handleSimulateRefresh}
              disabled={isRefreshing}
              className="px-2.5 py-1 text-[10px] font-['Space_Grotesk'] uppercase bg-[#354234] text-[#dee4da] hover:bg-[#252c25] flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[14px] text-[#bccbb8] ${isRefreshing ? 'animate-spin' : ''}`}>
                refresh
              </span>
              <span>SIMULATE API UPDATE</span>
            </button>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a100a] text-[#8e928b] space-y-2 z-10 font-['Space_Grotesk']">
            <span className="material-symbols-outlined text-[32px] text-[#bccbb8] animate-spin">progress_activity</span>
            <span className="text-[12px] uppercase tracking-wider">Fetching Knowledge Graph from API Service...</span>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a100a] p-6 text-center space-y-3 z-10 font-['Space_Grotesk']">
            <span className="material-symbols-outlined text-[36px] text-[#ffb4ab]">warning</span>
            <span className="text-[14px] text-[#ffb4ab] font-bold">API CONNECTION ERROR</span>
            <span className="text-[11px] text-[#8e928b] max-w-sm">{error}</span>
            <button
              onClick={loadData}
              className="px-3 py-1.5 bg-[#354234] text-[#dee4da] text-[11px] uppercase font-bold hover:bg-[#252c25]"
            >
              Retry API Fetch
            </button>
          </div>
        )}

        {/* Vis Network Canvas Viewport */}
        {!loading && !error && (
          <div 
            ref={containerRef} 
            className="w-full h-full cursor-grab active:cursor-grabbing relative z-0" 
          />
        )}

        {/* Bottom Floating Navigation HUD */}
        <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none gap-3">
          <div className="flex items-center gap-1.5 pointer-events-auto bg-[#171d17]/95 p-1.5 border border-[#444842]/30 text-[10px] font-['Space_Grotesk']">
            <span className="text-[#8e928b] uppercase px-1">MATCHING NODES: {filteredNodes.length} / {nodes.length}</span>
          </div>

          <div className="flex items-center gap-1 pointer-events-auto bg-[#171d17]/95 p-1 border border-[#444842]/30">
            <button 
              onClick={() => networkRef.current && networkRef.current.fit()} 
              className="w-7 h-7 flex items-center justify-center bg-[#1b211b] text-[#dee4da] hover:bg-[#252c25]" 
              title="Fit Screen"
            >
              <span className="material-symbols-outlined text-[16px]">fit_screen</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT-SIDE ENTITY INSPECTOR PANEL (Requirement #4 & Stitch Design) */}
      {selectedEntityId && (
        <aside className="w-96 xl:w-[420px] h-full bg-[#171d17] border-l border-[#444842]/30 flex flex-col z-40 shrink-0 shadow-2xl relative">
          {detailsLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-[#8e928b] space-y-2 font-['Space_Grotesk']">
              <span className="material-symbols-outlined text-[24px] text-[#bccbb8] animate-spin">progress_activity</span>
              <span className="text-[11px] uppercase tracking-wider">Fetching Entity Details...</span>
            </div>
          ) : entityDetails ? (
            <>
              {/* Header */}
              <div className="p-3 bg-[#1b211b] border-b border-[#444842]/30 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#ffb4ab]"></span>
                  <span className="font-['Space_Grotesk'] text-[11px] uppercase text-[#dee4da] font-bold tracking-wider">
                    {entityDetails.entity.type} / INSPECTOR
                  </span>
                </div>
                <button
                  onClick={() => { setSelectedEntityId(null); setEntityDetails(null); }}
                  className="p-1 text-[#c4c8c0] hover:text-[#dee4da] hover:bg-[#252c25]"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Dossier Body */}
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
                {/* Primary Identification Banner */}
                <div className="flex gap-3 items-start bg-[#0a100a] p-3 border border-[#444842]/30">
                  <div className="w-16 h-20 bg-[#252c25] shrink-0 border border-[#444842]/40 flex items-center justify-center text-[#bccbb8]">
                    <span className="material-symbols-outlined text-[32px]">
                      {getEntityMaterialIcon(entityDetails.entity.type)}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-['Space_Grotesk'] text-[16px] font-bold text-[#dee4da] truncate">
                      {entityDetails.entity.name}
                    </span>
                    <span className="font-['Space_Grotesk'] text-[11px] text-[#bccbb8]">
                      ID: {entityDetails.entity.id}
                    </span>
                    <div className="mt-2 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px] font-['Space_Grotesk']">
                        <span className="text-[#8e928b]">AI CONFIDENCE</span>
                        <span className="text-[#bbccae] font-bold">
                          {(entityDetails.entity.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-[#1b211b] h-1.5 flex">
                        <div 
                          className="bg-[#bccbb8] h-full" 
                          style={{ width: `${entityDetails.entity.confidence * 100}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Intelligence Narrative */}
                <div className="flex flex-col bg-[#0a100a] p-2.5 border border-[#444842]/30">
                  <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#8e928b] mb-1">
                    DOSSIER SUMMARY
                  </span>
                  <p className="text-[12px] text-[#c4c8c0] leading-relaxed">
                    {entityDetails.entity.details || "Indexed entity from API backend dataset."}
                  </p>
                </div>

                {/* Direct Relationships */}
                <div className="flex flex-col bg-[#0a100a] p-2.5 border border-[#444842]/30">
                  <div className="flex items-center justify-between pb-1 mb-1">
                    <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#8e928b]">
                      DIRECT RELATIONSHIPS ({(entityDetails.relationships || entityDetails.connections || []).length})
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                    {(entityDetails.relationships || entityDetails.connections || []).map((rel, idx) => {
                      const otherId = rel.source === entityDetails.entity.id ? rel.target : (rel.target || rel.personId || rel.id || `REL_${idx}`);
                      const relatedList = entityDetails.relatedEntities || [];
                      const otherObj = relatedList.find(e => e.id === otherId);
                      return (
                        <div key={idx} className="bg-[#1b211b] p-1.5 flex items-center justify-between text-[11px]">
                          <div className="flex flex-col">
                            <span className="font-['Space_Grotesk'] text-[#dee4da] font-semibold">
                              {otherObj ? otherObj.name : (rel.name || rel.title || otherId)}
                            </span>
                            <span className="font-['Space_Grotesk'] text-[10px] text-[#bbccae]">
                              {rel.relation || rel.relationshipType || rel.type || 'CONNECTED_TO'}
                            </span>
                          </div>
                          <span className="font-['Space_Grotesk'] text-[10px] text-[#8e928b]">
                            {((rel.confidence || 0.95) * 100).toFixed(0)}% Conf
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Relevant Events */}
                <div className="flex flex-col bg-[#0a100a] p-2.5 border border-[#444842]/30">
                  <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#8e928b] mb-1">
                    RELEVANT EVENTS ({(entityDetails.events || []).length})
                  </span>
                  {Array.isArray(entityDetails.events) && entityDetails.events.length > 0 ? (
                    <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                      {entityDetails.events.map((evt, idx) => (
                        <div key={evt.eventId || idx} className="bg-[#1b211b] p-1.5 flex justify-between items-center text-[11px]">
                          <span className="font-['Space_Grotesk'] text-[#dee4da] font-semibold">{evt.type || evt.eventType || 'EVENT'}</span>
                          <span className="font-['Space_Grotesk'] text-[10px] text-[#8e928b]">{evt.date || evt.timestamp || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#8e928b] italic">No event logs recorded.</span>
                  )}
                </div>

                {/* Forensic Hypothesis (ACH) for PERSON Entities */}
                {entityDetails.entity.type === 'PERSON' && (
                  <div className="flex flex-col bg-[#0a100a] p-2.5 border border-[#444842]/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#ffb77c] font-bold tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">psychology</span>
                        FORENSIC HYPOTHESIS (ACH)
                      </span>
                      {!inspectorHypothesis && !loadingHypothesis && (
                        <button
                          onClick={async () => {
                            setLoadingHypothesis(true);
                            try {
                              const hyp = await getPersonHypothesis(entityDetails.entity.id, activeCaseId);
                              setInspectorHypothesis(hyp);
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setLoadingHypothesis(false);
                            }
                          }}
                          className="text-[10px] font-['Space_Grotesk'] text-[#bccbb8] hover:text-[#dee4da] bg-[#252c25] hover:bg-[#354234] px-2 py-0.5 border border-[#444842]/40 uppercase tracking-wider transition-colors"
                        >
                          Load Theory
                        </button>
                      )}
                    </div>

                    {loadingHypothesis && (
                      <div className="py-2 flex items-center justify-center gap-2 text-[#bccbb8] text-xs font-['Space_Grotesk']">
                        <span className="material-symbols-outlined text-[16px] animate-spin text-[#ffb77c]">progress_activity</span>
                        <span>Synthesizing ACH Theory...</span>
                      </div>
                    )}

                    {inspectorHypothesis && (() => {
                      const prim = inspectorHypothesis.primary_hypothesis || {};
                      const alt = inspectorHypothesis.alternative_hypothesis || {};

                      const primTitle = typeof prim.title === 'string' ? prim.title : (typeof prim.theory === 'string' ? prim.theory : 'Primary Crime Theory');
                      const primProb = prim.probability_score != null ? String(prim.probability_score) : '88';
                      const primConf = typeof prim.confidence_level === 'string' ? prim.confidence_level : 'HIGH';

                      const moText = typeof prim.modus_operandi === 'object' && prim.modus_operandi !== null
                        ? (prim.modus_operandi.fact || prim.modus_operandi.description || prim.modus_operandi.text || '')
                        : (typeof prim.modus_operandi === 'string' ? prim.modus_operandi : '');

                      const falsText = typeof prim.falsification_test === 'object' && prim.falsification_test !== null
                        ? (prim.falsification_test.test || prim.falsification_test.criteria || prim.falsification_test.audit || prim.falsification_test.description || prim.falsification_test.fact || '')
                        : (typeof prim.falsification_test === 'string' ? prim.falsification_test : '');

                      const tactText = typeof prim.tactical_recommendation === 'object' && prim.tactical_recommendation !== null
                        ? (prim.tactical_recommendation.action || prim.tactical_recommendation.recommendation || prim.tactical_recommendation.text || '')
                        : (typeof prim.tactical_recommendation === 'string' ? prim.tactical_recommendation : '');

                      const altTitle = typeof alt.title === 'string' ? alt.title : (typeof alt.theory === 'string' ? alt.theory : 'Alternative Theory');
                      const altProb = alt.probability_score != null ? String(alt.probability_score) : '25';

                      return (
                        <div className="bg-[#171d17] p-2.5 border border-[#ffb4ab]/30 space-y-2 text-xs">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-['Space_Grotesk'] font-bold text-[#dee4da] truncate">
                              {primTitle}
                            </span>
                            <span className="font-['Space_Grotesk'] text-[10px] text-[#ffb4ab] font-bold bg-[#93000a]/40 px-1.5 py-0.5 border border-[#ffb4ab]/30 shrink-0">
                              {primProb}% {primConf}
                            </span>
                          </div>

                          {moText && (
                            <p className="text-[11px] text-[#c4c8c0] leading-relaxed">
                              {moText}
                            </p>
                          )}

                          {falsText && (
                            <div className="bg-[#0a100a] p-2 border border-[#ffdf9f]/20 text-[10px] text-[#ffdf9f] space-y-0.5">
                              <span className="font-bold uppercase tracking-wider block text-[9px]">Falsification Audit:</span>
                              <p className="text-[#dee4da]">{falsText}</p>
                            </div>
                          )}

                          {tactText && (
                            <div className="bg-[#0a100a] p-2 border border-[#bccbb8]/20 text-[10px] text-[#bccbb8] space-y-0.5">
                              <span className="font-bold uppercase tracking-wider block text-[9px]">Tactical Recommendation:</span>
                              <p className="text-[#dee4da] font-mono text-[10px]">{tactText}</p>
                            </div>
                          )}

                          {inspectorHypothesis.alternative_hypothesis && (
                            <div className="bg-[#0a100a] p-2 border border-[#444842]/30 text-[10px] text-[#8e928b]">
                              <span className="font-bold uppercase tracking-wider block text-[9px] text-[#8e928b]">
                                Alternative Theory ({altProb}%):
                              </span>
                              <p className="text-[#c4c8c0]">{altTitle}</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* STITCH CTA BUTTON: "KNOW MORE WITH AI" (Requirement #4 & Stitch) */}
              <div className="p-3 bg-[#252c25]/90 border-t border-[#444842]/30 flex flex-col">
                <button
                  onClick={() => onSelectTargetForAI(entityDetails.entity)}
                  className="w-full bg-[#354234] text-[#dee4da] hover:bg-[#bccbb8] hover:text-[#273426] py-2.5 px-3 flex items-center justify-between transition-colors font-['Space_Grotesk'] font-bold text-[12px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                    <span>KNOW MORE WITH AI</span>
                  </div>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </>
          ) : null}
        </aside>
      )}
    </div>
  );
}
