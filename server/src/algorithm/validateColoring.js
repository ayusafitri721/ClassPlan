export function validateColoring({ vertices, edges, colorOf }) {
  const uncolored = vertices
    .filter((vertex) => !colorOf.has(vertex.code))
    .map((vertex) => vertex.code);

  const conflicts = edges
    .filter((edge) => colorOf.get(edge.u) === colorOf.get(edge.v))
    .map((edge) => ({
      u: edge.u,
      v: edge.v,
      color: colorOf.get(edge.u) ?? null,
    }));

  return {
    isValid: uncolored.length === 0 && conflicts.length === 0,
    uncolored,
    conflicts,
    coloredVertices: colorOf.size,
    colorCount: new Set(colorOf.values()).size,
  };
}
