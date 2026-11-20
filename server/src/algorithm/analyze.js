import { DEFAULT_TIE_BREAK_RULE, CONFLICT_MODE } from '@classplan/shared';
import { buildGraph } from './buildGraph.js';
import { orderVertices } from './ordering.js';
import { welshPowell } from './welshPowell.js';
import { validateColoring } from './validateColoring.js';
import { maxClique } from './maxClique.js';

export function analyze({
  courses,
  conflictMode = CONFLICT_MODE.LECTURER,
  tieBreakRule = DEFAULT_TIE_BREAK_RULE,
}) {
  const graph = buildGraph(courses, { mode: conflictMode });
  const order = orderVertices(graph.vertices, tieBreakRule);
  const coloring = welshPowell(order, graph.adjacency);
  const validation = validateColoring({
    vertices: graph.vertices,
    edges: graph.edges,
    colorOf: coloring.colorOf,
  });

  const { clique, exact } = maxClique(graph.vertices, graph.adjacency);
  const lowerBound = clique.length;
  const optimality = {
    lowerBound,
    exact,
    gap: validation.colorCount - lowerBound,
    status: validation.colorCount === lowerBound ? 'optimal' : 'not_proven',
    clique: [...clique].sort(),
  };

  const trace = [
    {
      type: 'GRAPH_BUILT',
      vertexCount: graph.vertices.length,
      edgeCount: graph.edges.length,
    },
    {
      type: 'DEGREES_COMPUTED',
      degrees: graph.vertices
        .map((vertex) => ({
          code: vertex.code,
          name: vertex.name,
          degree: vertex.degree,
        }))
        .sort((a, b) => b.degree - a.degree || a.code.localeCompare(b.code, 'id')),
    },
    {
      type: 'ORDERED',
      order: order.map((vertex, index) => ({
        rank: index + 1,
        code: vertex.code,
        name: vertex.name,
        degree: vertex.degree,
        credits: vertex.credits,
      })),
    },
    ...coloring.steps,
    {
      type: 'VALIDATED',
      isValid: validation.isValid,
      colorCount: validation.colorCount,
      conflicts: validation.conflicts,
      uncolored: validation.uncolored,
    },
  ].map((step, index) => ({ step: index + 1, ...step }));

  return { graph, order, coloring, validation, optimality, trace };
}
