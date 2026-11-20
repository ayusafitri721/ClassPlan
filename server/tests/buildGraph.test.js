import { describe, expect, it } from 'vitest';
import { buildGraph } from '../src/algorithm/buildGraph.js';

function course(code, lecturers) {
  return { id: code.charCodeAt(0), code, name: code, credits: 2, lecturers };
}

const lecturer = (id, name) => ({ id, name });

describe('buildGraph', () => {
  it('tidak membuat sisi bila dosen berbeda', () => {
    const graph = buildGraph([course('A', [lecturer(1, 'Satu')]), course('B', [lecturer(2, 'Dua')])]);
    expect(graph.edges).toHaveLength(0);
    expect(graph.vertices.every((vertex) => vertex.degree === 0)).toBe(true);
  });

  it('membuat satu sisi walau dua dosen sama', () => {
    const shared = [lecturer(1, 'Satu'), lecturer(2, 'Dua')];
    const graph = buildGraph([course('A', shared), course('B', shared)]);
    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0].reason.lecturerIds).toEqual([1, 2]);
    expect(graph.vertices.map((vertex) => vertex.degree)).toEqual([1, 1]);
  });

  it('menghubungkan semua pasangan pada klik tiga', () => {
    const shared = [lecturer(1, 'Satu')];
    const graph = buildGraph([
      course('A', shared),
      course('B', shared),
      course('C', shared),
    ]);
    expect(graph.edges).toHaveLength(3);
    expect(graph.vertices.every((vertex) => vertex.degree === 2)).toBe(true);
  });

  it('menolak kode ganda', () => {
    expect(() =>
      buildGraph([course('A', [lecturer(1, 'Satu')]), course('A', [lecturer(2, 'Dua')])])
    ).toThrow(/ganda/);
  });

  it('menolak mode konflik yang belum didukung', () => {
    expect(() => buildGraph([], { mode: 'lecturer_class' })).toThrow(/belum didukung/);
  });
});
