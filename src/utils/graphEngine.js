// Graph Analytics & Algorithm Engine for Drishti Platform

/**
 * Calculates Degree Centrality for all nodes in graph
 */
export function calculateDegreeCentrality(nodes, edges) {
  const degreeMap = {};
  nodes.forEach(n => { degreeMap[n.id] = 0; });
  edges.forEach(e => {
    if (degreeMap[e.from] !== undefined) degreeMap[e.from]++;
    if (degreeMap[e.to] !== undefined) degreeMap[e.to]++;
  });
  return degreeMap;
}

/**
 * Calculates Betweenness Centrality using Brandes' Shortest Path algorithm approximation
 */
export function calculateBetweennessCentrality(nodes, edges) {
  const CB = {};
  nodes.forEach(n => { CB[n.id] = 0; });

  const adj = {};
  nodes.forEach(n => { adj[n.id] = []; });
  edges.forEach(e => {
    if (adj[e.from] && adj[e.to]) {
      adj[e.from].push(e.to);
      adj[e.to].push(e.from);
    }
  });

  const nodeIds = nodes.map(n => n.id);

  nodeIds.forEach(s => {
    const S = [];
    const P = {};
    const sigma = {};
    const d = {};
    nodeIds.forEach(v => {
      P[v] = [];
      sigma[v] = 0;
      d[v] = -1;
    });

    sigma[s] = 1;
    d[s] = 0;

    const Q = [s];
    while (Q.length > 0) {
      const v = Q.shift();
      S.push(v);
      (adj[v] || []).forEach(w => {
        if (d[w] < 0) {
          Q.push(w);
          d[w] = d[v] + 1;
        }
        if (d[w] === d[v] + 1) {
          sigma[w] += sigma[v];
          P[w].push(v);
        }
      });
    }

    const delta = {};
    nodeIds.forEach(v => { delta[v] = 0; });

    while (S.length > 0) {
      const w = S.pop();
      P[w].forEach(v => {
        delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
      });
      if (w !== s) {
        CB[w] += delta[w];
      }
    }
  });

  // Normalize betweenness scores between 0 and 1
  const maxCB = Math.max(...Object.values(CB), 1);
  const normalized = {};
  Object.keys(CB).forEach(id => {
    normalized[id] = Number((CB[id] / maxCB).toFixed(3));
  });

  return normalized;
}

/**
 * Calculates PageRank score for nodes
 */
export function calculatePageRank(nodes, edges, damping = 0.85, iterations = 20) {
  const N = nodes.length;
  if (N === 0) return {};

  let PR = {};
  nodes.forEach(n => { PR[n.id] = 1 / N; });

  const outDegree = {};
  const inEdges = {};
  nodes.forEach(n => {
    outDegree[n.id] = 0;
    inEdges[n.id] = [];
  });

  edges.forEach(e => {
    if (outDegree[e.from] !== undefined && inEdges[e.to] !== undefined) {
      outDegree[e.from]++;
      inEdges[e.to].push(e.from);
    }
  });

  for (let it = 0; it < iterations; it++) {
    const newPR = {};
    nodes.forEach(n => {
      let rankSum = 0;
      (inEdges[n.id] || []).forEach(inNode => {
        if (outDegree[inNode] > 0) {
          rankSum += PR[inNode] / outDegree[inNode];
        }
      });
      newPR[n.id] = ((1 - damping) / N) + (damping * rankSum);
    });
    PR = newPR;
  }

  // Normalize to 0-100 scale
  const maxPR = Math.max(...Object.values(PR), 0.001);
  const scaled = {};
  Object.keys(PR).forEach(id => {
    scaled[id] = Math.round((PR[id] / maxPR) * 100);
  });

  return scaled;
}

/**
 * Finds the shortest path between startNodeId and endNodeId with edge evidence trace
 */
export function findShortestPath(startNodeId, endNodeId, nodes, edges) {
  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  if (!nodeMap[startNodeId] || !nodeMap[endNodeId]) return null;

  const adj = {};
  nodes.forEach(n => { adj[n.id] = []; });
  edges.forEach(e => {
    if (adj[e.from] && adj[e.to]) {
      adj[e.from].push({ node: e.to, edge: e });
      adj[e.to].push({ node: e.from, edge: e });
    }
  });

  const queue = [[startNodeId]];
  const visited = new Set([startNodeId]);
  const edgePathMap = {};

  while (queue.length > 0) {
    const path = queue.shift();
    const currentNode = path[path.length - 1];

    if (currentNode === endNodeId) {
      // Reconstruct path with node and edge details
      const detailedSteps = [];
      for (let i = 0; i < path.length; i++) {
        const currNodeObj = nodeMap[path[i]];
        let connectingEdge = null;
        if (i > 0) {
          const prev = path[i - 1];
          const curr = path[i];
          connectingEdge = edges.find(
            e => (e.from === prev && e.to === curr) || (e.from === curr && e.to === prev)
          );
        }
        detailedSteps.push({
          node: currNodeObj,
          edge: connectingEdge
        });
      }
      return detailedSteps;
    }

    (adj[currentNode] || []).forEach(({ node: neighbor, edge }) => {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    });
  }

  return null;
}

/**
 * Enriches graph nodes with centrality & updated risk scores
 */
export function enrichGraphData(nodes, edges) {
  const degreeMap = calculateDegreeCentrality(nodes, edges);
  const betweennessMap = calculateBetweennessCentrality(nodes, edges);
  const pageRankMap = calculatePageRank(nodes, edges);

  return nodes.map(node => {
    const deg = degreeMap[node.id] || 0;
    const bet = betweennessMap[node.id] || 0;
    const pr = pageRankMap[node.id] || 50;

    // Recalculate composite risk score
    let compositeRisk = node.riskScore || 50;
    compositeRisk = Math.min(100, Math.max(10, Math.round(compositeRisk * 0.5 + pr * 0.3 + bet * 20)));

    return {
      ...node,
      degree: deg,
      betweenness: bet,
      pageRank: pr,
      computedRisk: compositeRisk
    };
  });
}
