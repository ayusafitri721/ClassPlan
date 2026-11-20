import { describe, expect, it } from 'vitest';
import { orderVertices } from '../src/algorithm/ordering.js';
import { TIE_BREAK, DEFAULT_TIE_BREAK_RULE } from '@classplan/shared';

const vertex = (code, degree, credits) => ({ code, degree, credits });

describe('orderVertices', () => {
  it('mengutamakan derajat terbesar', () => {
    const result = orderVertices(
      [vertex('A', 0, 3), vertex('B', 4, 1), vertex('C', 2, 2)],
      DEFAULT_TIE_BREAK_RULE
    );
    expect(result.map((item) => item.code)).toEqual(['B', 'C', 'A']);
  });

  it('memakai SKS menurun saat derajat sama', () => {
    const result = orderVertices(
      [vertex('A', 2, 1), vertex('B', 2, 3), vertex('C', 2, 2)],
      DEFAULT_TIE_BREAK_RULE
    );
    expect(result.map((item) => item.code)).toEqual(['B', 'C', 'A']);
  });

  it('memakai kode menaik saat derajat dan SKS sama', () => {
    const result = orderVertices(
      [vertex('PSD', 2, 2), vertex('MD', 2, 2), vertex('SD', 2, 2)],
      DEFAULT_TIE_BREAK_RULE
    );
    expect(result.map((item) => item.code)).toEqual(['MD', 'PSD', 'SD']);
  });

  it('menghormati rantai aturan tanpa SKS', () => {
    const result = orderVertices(
      [vertex('A', 2, 1), vertex('B', 2, 3)],
      [TIE_BREAK.DEGREE_DESC, TIE_BREAK.COURSE_CODE_ASC]
    );
    expect(result.map((item) => item.code)).toEqual(['A', 'B']);
  });

  it('menolak aturan kosong atau tidak dikenal', () => {
    expect(() => orderVertices([], [])).toThrow(/tidak boleh kosong/);
    expect(() => orderVertices([], ['warna_desc'])).toThrow(/tidak dikenal/);
  });

  it('tidak mengubah array masukan', () => {
    const input = [vertex('B', 1, 2), vertex('A', 2, 2)];
    orderVertices(input, DEFAULT_TIE_BREAK_RULE);
    expect(input.map((item) => item.code)).toEqual(['B', 'A']);
  });
});
