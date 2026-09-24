// Graph Adapter Layer
// Dedicated adapter transforming backend response contract (entities + relationships)
// into Vis-Network nodes + edges required by the graph rendering library.
// DOES NOT modify backend response contract.

import { enrichGraphData } from './graphEngine';

export function transformBackendToVisFormat(entities = [], relationships = []) {
  // Map backend entities -> Vis graph nodes
  const rawNodes = entities.map(entity => {
    return {
      id: entity.id,
      label: entity.name,
      type: entity.type,
      confidence: entity.confidence,
      riskScore: Math.round((entity.confidence || 0.5) * 100),
      role: entity.role || entity.type,
      phone: entity.phone,
      aliases: entity.aliases,
      status: entity.status,
      cell: entity.cell,
      details: entity.details,
      rawEntity: entity
    };
  });

  // Map backend relationships -> Vis graph edges
  const rawEdges = relationships.map((rel, index) => {
    return {
      id: `rel_${rel.source}_${rel.target}_${index}`,
      from: rel.source,
      to: rel.target,
      label: rel.relation,
      confidence: rel.confidence,
      weight: Math.round((rel.confidence || 0.5) * 10),
      type: (rel.relation === 'TRANSFERRED_MONEY' ? 'financial' : rel.relation === 'CALLS' ? 'communication' : 'standard')
    };
  });

  // Enrich nodes with graph algorithms (PageRank, Betweenness Centrality, Composite Risk)
  const enrichedNodes = enrichGraphData(rawNodes, rawEdges);

  return {
    nodes: enrichedNodes,
    edges: rawEdges
  };
}
