import { describe, expect, it } from 'vitest';
import { DEFAULT_TIE_BREAK_RULE } from '@classplan/shared';
import { analyze } from '../src/algorithm/analyze.js';
import { caseStudyCourses } from './fixtures/caseStudy.js';
import { cohort2025Courses } from './fixtures/cohort2025.js';

const run = (courses) => analyze({ courses, tieBreakRule: DEFAULT_TIE_BREAK_RULE });

describe('kelas D angkatan 2025', () => {
  const result = run(cohort2025Courses);

  it('membentuk 14 simpul dan 16 sisi', () => {
    expect(result.graph.vertices).toHaveLength(14);
    expect(result.graph.edges).toHaveLength(16);
  });

  it('menghitung derajat sesuai hubungan dosen', () => {
    const degree = Object.fromEntries(
      result.graph.vertices.map((vertex) => [vertex.code, vertex.degree])
    );
    expect(degree).toMatchObject({
      PW: 4,
      PPW: 4,
      IMK1: 4,
      IMK2: 4,
      PIMK: 4,
      SO: 3,
      PSO: 3,
      'PTI-K': 3,
      'PTI-J': 3,
      SP: 0,
      PDS: 0,
      TECH: 0,
      AB: 0,
      MPSI: 0,
    });
  });

  it('menghasilkan 5 warna yang valid dan optimal', () => {
    expect(result.validation.isValid).toBe(true);
    expect(result.validation.conflicts).toHaveLength(0);
    expect(result.validation.colorCount).toBe(5);
    expect(result.optimality.lowerBound).toBe(5);
    expect(result.optimality.status).toBe('optimal');
    expect(result.optimality.clique).toHaveLength(5);
  });
});

describe('analisis gabungan dua angkatan', () => {
  const result = run([...caseStudyCourses, ...cohort2025Courses]);

  it('membentuk 24 simpul dan 34 sisi', () => {
    expect(result.graph.vertices).toHaveLength(24);
    expect(result.graph.edges).toHaveLength(34);
  });

  it('menemukan clique tujuh dari dosen yang mengampu lintas angkatan', () => {
    expect(result.optimality.lowerBound).toBe(7);
    expect(result.optimality.exact).toBe(true);
  });

  it('tetap valid dengan jumlah warna sama dengan batas bawah', () => {
    expect(result.validation.isValid).toBe(true);
    expect(result.validation.colorCount).toBe(7);
    expect(result.optimality.status).toBe('optimal');
  });
});
