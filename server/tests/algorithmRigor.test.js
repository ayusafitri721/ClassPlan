import { describe, expect, it } from 'vitest';
import { DEFAULT_TIE_BREAK_RULE } from '@classplan/shared';
import { analyze } from '../src/algorithm/analyze.js';
import { buildGraph } from '../src/algorithm/buildGraph.js';
import { orderVertices } from '../src/algorithm/ordering.js';
import { welshPowell } from '../src/algorithm/welshPowell.js';
import { validateColoring } from '../src/algorithm/validateColoring.js';
import { maxClique } from '../src/algorithm/maxClique.js';
import { buildCsvRows, buildReport } from '../src/modules/runs/runs.report.js';
import { toCsv } from '../src/utils/csv.js';
import { caseStudyCourses } from './fixtures/caseStudy.js';

function lcg(seed) {
  let state = seed;
  return () => (state = (state * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
}

function randomGraph(seed, size, density) {
  const rand = lcg(seed);
  const codes = Array.from({ length: size }, (_, index) => String.fromCharCode(65 + index));
  const adjacency = new Map(codes.map((code) => [code, new Set()]));
  const edges = [];

  for (let i = 0; i < size; i += 1) {
    for (let j = i + 1; j < size; j += 1) {
      if (rand() >= density) continue;
      const u = codes[i];
      const v = codes[j];
      adjacency.get(u).add(v);
      adjacency.get(v).add(u);
      edges.push({ u, v });
    }
  }

  const vertices = codes.map((code, index) => ({
    code,
    credits: 1 + (index % 4),
    degree: adjacency.get(code).size,
  }));

  return { codes, adjacency, edges, vertices };
}

function bruteForceMaxClique(codes, adjacency) {
  let best = 0;
  for (let mask = 0; mask < 1 << codes.length; mask += 1) {
    const subset = codes.filter((_, index) => mask & (1 << index));
    const isClique = subset.every((u) =>
      subset.every((v) => u === v || adjacency.get(u)?.has(v))
    );
    if (isClique) best = Math.max(best, subset.length);
  }
  return best;
}

function isClique(members, adjacency) {
  return members.every((u) => members.every((v) => u === v || adjacency.get(u)?.has(v)));
}

describe('maxClique dibanding brute force', () => {
  it('memberikan ukuran clique maksimum yang sama pada 30 graf acak kecil', () => {
    for (let seed = 1; seed <= 30; seed += 1) {
      const graph = randomGraph(seed, 5 + (seed % 4), 0.3 + (seed % 5) / 10);
      const result = maxClique(graph.vertices, graph.adjacency);
      expect(result.exact).toBe(true);
      expect(isClique(result.clique, graph.adjacency)).toBe(true);
      expect(result.clique.length).toBe(
        bruteForceMaxClique(graph.codes, graph.adjacency)
      );
    }
  });

  it('memakai pendekatan greedy dan menandai exact=false di atas 32 simpul', () => {
    const size = 33;
    const codes = Array.from({ length: size }, (_, index) => `K${index}`);
    const adjacency = new Map(codes.map((code) => [code, new Set()]));

    // Lima simpul pertama membentuk K5, sisanya terisolasi.
    for (let i = 0; i < 5; i += 1) {
      for (let j = i + 1; j < 5; j += 1) {
        adjacency.get(codes[i]).add(codes[j]);
        adjacency.get(codes[j]).add(codes[i]);
      }
    }

    const vertices = codes.map((code) => ({ code, degree: adjacency.get(code).size, credits: 2 }));
    const result = maxClique(vertices, adjacency);

    expect(result.exact).toBe(false);
    expect(result.clique.length).toBe(5);
    expect(isClique(result.clique, adjacency)).toBe(true);
  });
});

describe('invarian Welch Powell pada graf acak', () => {
  it('selalu valid, partisi semua simpul, dan tidak kurang dari batas bawah', () => {
    for (let seed = 1; seed <= 30; seed += 1) {
      const graph = randomGraph(seed + 100, 6 + (seed % 7), 0.2 + (seed % 6) / 10);
      const order = orderVertices(graph.vertices);
      const coloring = welshPowell(order, graph.adjacency);
      const validation = validateColoring({
        vertices: graph.vertices,
        edges: graph.edges,
        colorOf: coloring.colorOf,
      });
      const lowerBound = maxClique(graph.vertices, graph.adjacency).clique.length;

      expect(validation.isValid).toBe(true);
      expect(coloring.groups.flatMap((group) => group.members).sort()).toEqual(
        [...graph.codes].sort()
      );
      expect(coloring.colorCount).toBeGreaterThanOrEqual(lowerBound);
      expect(coloring.colorCount).toBeLessThanOrEqual(graph.codes.length);
    }
  });

  it('menghasilkan urutan dan kelompok yang deterministik', () => {
    const first = analyze({ courses: caseStudyCourses, tieBreakRule: DEFAULT_TIE_BREAK_RULE });
    const second = analyze({ courses: caseStudyCourses, tieBreakRule: DEFAULT_TIE_BREAK_RULE });

    expect(first.order.map((vertex) => vertex.code)).toEqual(
      second.order.map((vertex) => vertex.code)
    );
    expect([...first.coloring.colorOf]).toEqual([...second.coloring.colorOf]);
  });
});

describe('konsistensi trace dengan hasil akhir', () => {
  it('pemutaran trace sampai langkah terakhir sama dengan pewarnaan akhir', () => {
    const result = analyze({ courses: caseStudyCourses });
    const replayed = new Map();

    for (const step of result.trace) {
      if (step.type === 'COLOR_OPENED' || step.type === 'VERTEX_COLORED') {
        replayed.set(step.code, step.color);
      }
    }

    expect(replayed).toEqual(result.coloring.colorOf);
    expect(result.trace.at(-1).type).toBe('VALIDATED');
    expect(result.trace.at(-1).isValid).toBe(true);
  });
});

describe('status optimalitas', () => {
  // Graf ini sengaja dipilih: Welch Powell perlu 5 warna, padahal graf
  // bisa diwarnai dengan 4 warna. Batas bawah clique juga 4.
  const pairs = [
    ['A', 'B'], ['A', 'C'], ['A', 'D'], ['A', 'E'],
    ['B', 'C'], ['B', 'E'], ['B', 'G'], ['C', 'E'],
    ['C', 'F'], ['C', 'G'], ['D', 'F'], ['E', 'F'],
    ['E', 'G'], ['F', 'G'],
  ];

  function coursesFromPairs() {
    const lecturers = pairs.map((_, index) => ({ id: index + 1, name: `D${index + 1}` }));
    const courses = Array.from({ length: 7 }, (_, index) => {
      const code = String.fromCharCode(65 + index);
      return { id: index + 1, code, name: code, credits: 2, lecturers: [] };
    });

    pairs.forEach(([u, v], index) => {
      courses.find((course) => course.code === u).lecturers.push(lecturers[index]);
      courses.find((course) => course.code === v).lecturers.push(lecturers[index]);
    });
    return courses;
  }

  it('menandai belum terbukti optimal bila jumlah warna melampaui batas bawah', () => {
    const result = analyze({ courses: coursesFromPairs() });

    expect(result.graph.edges).toHaveLength(14);
    expect(result.validation.colorCount).toBe(5);
    expect(result.optimality.lowerBound).toBe(4);
    expect(result.optimality.gap).toBe(1);
    expect(result.optimality.status).toBe('not_proven');
    expect(result.validation.isValid).toBe(true);
  });

  it('menyatakan optimal hanya bila jumlah warna sama dengan batas bawah', () => {
    const result = analyze({ courses: caseStudyCourses });
    expect(result.validation.colorCount).toBe(result.optimality.lowerBound);
    expect(result.optimality.status).toBe('optimal');
  });
});

describe('kasus tepi buildGraph dan ordering', () => {
  it('menerima daftar kosong', () => {
    const graph = buildGraph([]);
    expect(graph.vertices).toHaveLength(0);
    expect(graph.edges).toHaveLength(0);
    expect(graph.adjacency.size).toBe(0);
  });

  it('tidak membuat sisi untuk mata kuliah tanpa data dosen', () => {
    const graph = buildGraph([
      { code: 'A', credits: 2 },
      { code: 'B', credits: 2 },
    ]);
    expect(graph.edges).toHaveLength(0);
    expect(graph.vertices.every((vertex) => vertex.degree === 0)).toBe(true);
  });

  it('menduplikasi sisi berdasarkan pasangan, bukan jumlah dosen', () => {
    const shared = [
      { id: 1, name: 'Satu' },
      { id: 2, name: 'Dua' },
      { id: 3, name: 'Tiga' },
    ];
    const graph = buildGraph([
      { code: 'A', credits: 2, lecturers: shared },
      { code: 'B', credits: 2, lecturers: shared },
    ]);
    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0].reason.lecturerIds).toEqual([1, 2, 3]);
    expect(graph.adjacency.get('A').has('B')).toBe(true);
    expect(graph.adjacency.get('B').has('A')).toBe(true);
  });

  it('menghormati urutan rantai aturan', () => {
    const vertices = [
      { code: 'A', degree: 1, credits: 4 },
      { code: 'B', degree: 3, credits: 1 },
    ];
    const byCredits = orderVertices(vertices, ['credits_desc', 'degree_desc']);
    const byDegree = orderVertices(vertices, ['degree_desc', 'credits_desc']);

    expect(byCredits.map((item) => item.code)).toEqual(['A', 'B']);
    expect(byDegree.map((item) => item.code)).toEqual(['B', 'A']);
    expect(() => orderVertices(vertices, ['degree_desc', 'warna_desc'])).toThrow(/tidak dikenal/);
  });
});

describe('validasi pewarnaan', () => {
  it('mengumpulkan semua pelanggaran sekaligus', () => {
    const vertices = [
      { code: 'A' }, { code: 'B' }, { code: 'C' }, { code: 'D' },
    ];
    const edges = [
      { u: 'A', v: 'B' },
      { u: 'C', v: 'D' },
      { u: 'A', v: 'C' },
    ];
    const result = validateColoring({
      vertices,
      edges,
      colorOf: new Map([['A', 1], ['B', 1], ['C', 1]]),
    });

    expect(result.isValid).toBe(false);
    expect(result.conflicts).toHaveLength(2);
    expect(result.uncolored).toEqual(['D']);
    expect(result.colorCount).toBe(1);
  });
});

describe('logika laporan dan CSV', () => {
  const analysis = analyze({ courses: caseStudyCourses });
  const courseByCode = new Map(analysis.graph.vertices.map((vertex) => [vertex.code, vertex]));
  const groups = analysis.coloring.groups.map((group) => ({
    color: group.color,
    totalCredits: group.members.reduce(
      (total, code) => total + courseByCode.get(code).credits,
      0
    ),
    courses: group.members.map((code) => {
      const vertex = courseByCode.get(code);
      return {
        code,
        name: vertex.name,
        credits: vertex.credits,
        degree: vertex.degree,
        lecturers: vertex.lecturers,
      };
    }),
  }));
  const run = {
    id: 1,
    className: 'Kelas D',
    scopeLabel: 'Kelas D – Angkatan 2026',
    studyProgram: 'D3 Sistem Informasi',
    academicYear: '2026/2027',
    term: 'ganjil',
    conflictMode: 'lecturer',
    tieBreakRule: DEFAULT_TIE_BREAK_RULE,
    createdAt: '2026-11-21T00:00:00.000Z',
    colorCount: analysis.validation.colorCount,
    validationStatus: 'valid',
    graphSnapshot: analysis.graph,
    trace: analysis.trace,
    results: analysis.graph.vertices.map((vertex) => ({
      code: vertex.code,
      name: vertex.name,
      color: analysis.coloring.colorOf.get(vertex.code),
    })),
    groups,
    settingsSnapshot: { optimality: analysis.optimality },
  };

  it('membangun matriks ketetanggaan yang simetris', () => {
    const report = buildReport(run);
    const { codes, matrix } = report.adjacency;
    const size = codes.length;
    let ones = 0;

    for (let i = 0; i < size; i += 1) {
      expect(matrix[i][i]).toBe(0);
      for (let j = 0; j < size; j += 1) {
        expect(matrix[i][j]).toBe(matrix[j][i]);
        if (matrix[i][j] === 1) ones += 1;
      }
    }
    expect(codes).toHaveLength(10);
    expect(ones).toBe(2 * report.edges.length);
    expect(report.limitations).toHaveLength(4);
    expect(report.meta.scopeLabel).toBe('Kelas D – Angkatan 2026');
  });

  it('mengurutkan derajat menurun dan menyiapkan baris CSV', () => {
    const report = buildReport(run);
    const degrees = report.degrees.map((item) => item.degree);
    expect(degrees).toEqual([...degrees].sort((a, b) => b - a));

    const rows = buildCsvRows(run);
    expect(rows).toHaveLength(10);
    expect(rows[0]).toHaveProperty('lecturers');
    expect(rows[0].lecturers).toContain(';');
  });

  it('meng-escape sel koma, kutip, semicolon, dan baris baru', () => {
    const csv = toCsv(
      [{ key: 'nama', label: 'Nama' }],
      [{ nama: 'Dr. A, "B"; C\nD' }]
    );
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('"Dr. A, ""B""; C\nD"');
  });
});
