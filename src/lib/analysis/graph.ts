import type { Node, Edge } from "reactflow";

type AdjacencyList = Map<string, string[]>;

function buildAdjacencyList(edges: Edge[]): AdjacencyList {
  const adjList: AdjacencyList = new Map();
  edges.forEach((edge) => {
    if (!adjList.has(edge.source)) {
      adjList.set(edge.source, []);
    }
    adjList.get(edge.source)!.push(edge.target);
  });
  return adjList;
}

export function detectCircularDependencies(
  nodes: Node[],
  edges: Edge[],
): string[][] {
  const adjList = buildAdjacencyList(edges);
  const cycles: string[][] = [];
  const path: string[] = [];
  const visited: Set<string> = new Set();
  const recursionStack: Set<string> = new Set();

  function dfs(nodeId: string) {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const neighbors = adjList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (recursionStack.has(neighbor)) {
        const cycle = path.slice(path.indexOf(neighbor));
        cycle.push(neighbor);
        cycles.push(cycle);
      } else if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }

    path.pop();
    recursionStack.delete(nodeId);
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      dfs(node.id);
    }
  }

  return cycles;
}

export function findAffectedNodesAndEdges(
  failedNodeId: string,
  allNodes: Node[],
  allEdges: Edge[],
): { affectedNodes: string[]; affectedEdges: string[] } {
  const affectedNodes = new Set<string>();
  const affectedEdges = new Set<string>();
  const queue: string[] = [failedNodeId];
  affectedNodes.add(failedNodeId);

  // Build a map of source -> [target, edgeId] for efficient traversal
  const adjMap = new Map<string, Array<{ target: string; edgeId: string }>>();
  allEdges.forEach((edge) => {
    if (!adjMap.has(edge.source)) {
      adjMap.set(edge.source, []);
    }
    adjMap.get(edge.source)?.push({ target: edge.target, edgeId: edge.id });
  });

  let head = 0;
  while (head < queue.length) {
    const currentNodeId = queue[head++];
    const outgoingConnections = adjMap.get(currentNodeId) || [];

    for (const connection of outgoingConnections) {
      const { target, edgeId } = connection;
      if (!affectedNodes.has(target)) {
        affectedNodes.add(target);
        queue.push(target);
      }
      affectedEdges.add(edgeId);
    }
  }

  return { affectedNodes: Array.from(affectedNodes), affectedEdges: Array.from(affectedEdges) };
}

export function calculateFanOutCounts(
  nodes: Node[],
  edges: Edge[],
): Map<string, number> {
  const fanOutCounts = new Map<string, number>();
  nodes.forEach((node) => fanOutCounts.set(node.id, 0));

  edges.forEach((edge) => {
    const currentCount = fanOutCounts.get(edge.source) || 0;
    fanOutCounts.set(edge.source, currentCount + 1);
  });

  return fanOutCounts;
}

export function calculateFanInCounts(
  nodes: Node[],
  edges: Edge[],
): Map<string, number> {
  const fanInCounts = new Map<string, number>();
  nodes.forEach((node) => fanInCounts.set(node.id, 0));

  edges.forEach((edge) => {
    const currentCount = fanInCounts.get(edge.target) || 0;
    fanInCounts.set(edge.target, currentCount + 1);
  });

  return fanInCounts;
}

export function findSinglePointsOfFailure(
  nodes: Node[],
  edges: Edge[],
  threshold: { fanIn: number; fanOut: number } = { fanIn: 3, fanOut: 3 },
): string[] {
  const fanInCounts = calculateFanInCounts(nodes, edges);
  const fanOutCounts = calculateFanOutCounts(nodes, edges);
  const spofs: string[] = [];

  nodes.forEach((node) => {
    const fIn = fanInCounts.get(node.id) || 0;
    const fOut = fanOutCounts.get(node.id) || 0;

    if (fIn >= threshold.fanIn && fOut >= threshold.fanOut) {
      spofs.push(node.id);
    }
  });

  return spofs;
}
