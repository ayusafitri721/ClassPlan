import { describe, expect, it } from 'vitest';
import { analyze } from '../src/algorithm/analyze.js';
import { DEFAULT_TIE_BREAK_RULE } from '@classplan/shared';
import { caseStudyCourses } from './fixtures/caseStudy.js';

const codes = (group) => [...group].sort();

describe('data studi kasus', () => {
  const result = analyze({
    courses: caseStudyCourses,
    tieBreakRule: DEFAULT_TIE_BREAK_RULE,
  });

  it('membentuk 10 simpul dan 5 sisi konflik dosen', () => {
    expect(result.graph.vertices).toHaveLength(10);
    expect(result.graph.edges).toHaveLength(5);
    const pairs = result.graph.edges.map((edge) => [edge.u, edge.v].sort().join('-')).sort();
    expect(pairs).toEqual(['DP-PDP', 'KBD-PKBD', 'MD-PSD', 'MD-SD', 'PSD-SD']);
  });

  it('menghitung derajat sesuai model', () => {
    const degree = Object.fromEntries(
      result.graph.vertices.map((vertex) => [vertex.code, vertex.degree])
    );
    expect(degree).toMatchObject({
      MD: 2,
      SD: 2,
      PSD: 2,
      DP: 1,
      PDP: 1,
      KBD: 1,
      PKBD: 1,
      PA: 0,
      PC: 0,
      PBN: 0,
    });
  });

  it('mengurutkan dengan derajat, SKS, lalu kode', () => {
    expect(result.order.map((vertex) => vertex.code)).toEqual([
      'MD',
      'PSD',
      'SD',
      'DP',
      'KBD',
      'PDP',
      'PKBD',
      'PA',
      'PBN',
      'PC',
    ]);
  });

  it('menghasilkan 3 warna yang valid dan optimal', () => {
    expect(result.validation.isValid).toBe(true);
    expect(result.validation.conflicts).toHaveLength(0);
    expect(result.validation.colorCount).toBe(3);
    expect(result.optimality.lowerBound).toBe(3);
    expect(result.optimality.status).toBe('optimal');
  });

  it('mengelompokkan sesuai aturan yang dijalankan', () => {
    const groups = result.coloring.groups.map((group) => codes(group.members));
    expect(groups).toEqual([
      ['DP', 'KBD', 'MD', 'PA', 'PBN', 'PC'],
      ['PDP', 'PKBD', 'PSD'],
      ['SD'],
    ]);
  });

  it('mencatat setiap langkah pewarnaan pada trace', () => {
    const opened = result.trace.filter((step) => step.type === 'COLOR_OPENED');
    const closed = result.trace.filter((step) => step.type === 'COLOR_CLOSED');
    const skipped = result.trace.filter((step) => step.type === 'VERTEX_SKIPPED');
    expect(opened).toHaveLength(3);
    expect(closed).toHaveLength(3);
    expect(skipped.length).toBeGreaterThan(0);
    expect(result.trace.at(-1).type).toBe('VALIDATED');
  });

  it('mencocokkan tabel acuan bila SKS SD dikoreksi menjadi 3', () => {
    const corrected = caseStudyCourses.map((course) =>
      course.code === 'SD' ? { ...course, credits: 3 } : course
    );
    const result = analyze({
      courses: corrected,
      tieBreakRule: DEFAULT_TIE_BREAK_RULE,
    });
    const groups = result.coloring.groups.map((group) => codes(group.members));
    expect(result.order.map((vertex) => vertex.code).slice(0, 3)).toEqual(['MD', 'SD', 'PSD']);
    expect(groups).toEqual([
      ['DP', 'KBD', 'MD', 'PA', 'PBN', 'PC'],
      ['PDP', 'PKBD', 'SD'],
      ['PSD'],
    ]);
    expect(result.validation.colorCount).toBe(3);
  });
});
