import { describe, expect, it } from 'vitest';
import { welshPowell } from '../src/algorithm/welshPowell.js';
import { validateColoring } from '../src/algorithm/validateColoring.js';

function makeGraph(codes, pairs) {
  const adjacency = new Map(codes.map((code) => [code, new Set()]));
  for (const [u, v] of pairs) {
    adjacency.get(u).add(v);
    adjacency.get(v).add(u);
  }
  const vertices = codes.map((code) => ({ code, degree: adjacency.get(code).size }));
  const edges = pairs.map(([u, v]) => ({ u, v }));
  return { vertices, adjacency, edges };
}

const ordered = (vertices) =>
  [...vertices].sort((a, b) => b.degree - a.degree || a.code.localeCompare(b.code));

describe('welshPowell', () => {
  it('memberi satu warna pada graf tanpa sisi', () => {
    const graph = makeGraph(['A', 'B', 'C'], []);
    const result = welshPowell(ordered(graph.vertices), graph.adjacency);
    expect(result.colorCount).toBe(1);
    expect(result.groups[0].members).toEqual(['A', 'B', 'C']);
    expect(result.colorOf.size).toBe(3);
  });

  it('memberi lima warna pada graf lengkap lima simpul', () => {
    const codes = ['A', 'B', 'C', 'D', 'E'];
    const pairs = [];
    for (let i = 0; i < codes.length; i += 1) {
      for (let j = i + 1; j < codes.length; j += 1) pairs.push([codes[i], codes[j]]);
    }
    const graph = makeGraph(codes, pairs);
    const result = welshPowell(ordered(graph.vertices), graph.adjacency);
    expect(result.colorCount).toBe(5);
    const validation = validateColoring({
      vertices: graph.vertices,
      edges: graph.edges,
      colorOf: result.colorOf,
    });
    expect(validation.isValid).toBe(true);
  });

  it('mewarnai klik tiga dengan tiga warna', () => {
    const graph = makeGraph(['A', 'B', 'C'], [
      ['A', 'B'],
      ['A', 'C'],
      ['B', 'C'],
    ]);
    const result = welshPowell(ordered(graph.vertices), graph.adjacency);
    expect(result.colorCount).toBe(3);
  });

  it('mencatat simpul yang dilewati beserta penyebabnya', () => {
    const graph = makeGraph(['A', 'B'], [['A', 'B']]);
    const result = welshPowell(ordered(graph.vertices), graph.adjacency);
    const skipped = result.steps.find((step) => step.type === 'VERTEX_SKIPPED');
    expect(skipped.blockedBy).toEqual(['A']);
  });
});

describe('validateColoring', () => {
  it('menandai sisi dengan warna sama sebagai konflik', () => {
    const graph = makeGraph(['A', 'B'], [['A', 'B']]);
    const result = validateColoring({
      vertices: graph.vertices,
      edges: graph.edges,
      colorOf: new Map([
        ['A', 1],
        ['B', 1],
      ]),
    });
    expect(result.isValid).toBe(false);
    expect(result.conflicts).toHaveLength(1);
  });

  it('menandai simpul yang belum berwarna', () => {
    const graph = makeGraph(['A', 'B'], []);
    const result = validateColoring({
      vertices: graph.vertices,
      edges: graph.edges,
      colorOf: new Map([['A', 1]]),
    });
    expect(result.isValid).toBe(false);
    expect(result.uncolored).toEqual(['B']);
  });
});
