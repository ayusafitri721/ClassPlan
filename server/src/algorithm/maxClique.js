const EXACT_LIMIT = 32;

function greedyClique(order, adjacency) {
  const clique = [];
  for (const vertex of order) {
    if (clique.every((member) => adjacency.get(member)?.has(vertex))) {
      clique.push(vertex);
    }
  }
  return clique;
}

export function maxClique(vertices, adjacency) {
  const nodes = vertices.map((vertex) => vertex.code).sort();

  if (nodes.length > EXACT_LIMIT) {
    const byDegree = [...vertices]
      .sort((a, b) => b.degree - a.degree)
      .map((vertex) => vertex.code);
    return { clique: greedyClique(byDegree, adjacency), exact: false };
  }

  let best = [];

  const expand = (candidates, excluded, current) => {
    if (candidates.size === 0 && excluded.size === 0) {
      if (current.length > best.length) best = [...current];
      return;
    }

    let pivot = null;
    let pivotScore = -1;
    for (const vertex of [...candidates, ...excluded]) {
      const neighbors = adjacency.get(vertex) ?? new Set();
      let score = 0;
      for (const candidate of candidates) {
        if (neighbors.has(candidate)) score += 1;
      }
      if (score > pivotScore) {
        pivot = vertex;
        pivotScore = score;
      }
    }

    const pivotNeighbors = pivot ? adjacency.get(pivot) ?? new Set() : new Set();
    const options = [...candidates].filter((vertex) => !pivotNeighbors.has(vertex));

    for (const vertex of options) {
      const neighbors = adjacency.get(vertex) ?? new Set();
      const nextCandidates = new Set([...candidates].filter((item) => neighbors.has(item)));
      const nextExcluded = new Set([...excluded].filter((item) => neighbors.has(item)));

      expand(nextCandidates, nextExcluded, [...current, vertex]);

      candidates.delete(vertex);
      excluded.add(vertex);

      if (best.length === nodes.length) return;
    }
  };

  expand(new Set(nodes), new Set(), []);

  return { clique: best, exact: true };
}
