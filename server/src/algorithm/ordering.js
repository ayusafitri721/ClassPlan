import { TIE_BREAK, DEFAULT_TIE_BREAK_RULE } from '@classplan/shared';

const COMPARATORS = {
  [TIE_BREAK.DEGREE_DESC]: (a, b) => b.degree - a.degree,
  [TIE_BREAK.CREDITS_DESC]: (a, b) => b.credits - a.credits,
  [TIE_BREAK.COURSE_CODE_ASC]: (a, b) => a.code.localeCompare(b.code, 'id', { sensitivity: 'base' }),
};

export function orderVertices(vertices, rule = DEFAULT_TIE_BREAK_RULE) {
  if (!Array.isArray(rule) || rule.length === 0) {
    throw new Error('Aturan pemecah seri tidak boleh kosong');
  }

  for (const key of rule) {
    if (!COMPARATORS[key]) {
      throw new Error(`Aturan pemecah seri tidak dikenal: ${key}`);
    }
  }

  return [...vertices].sort((a, b) => {
    for (const key of rule) {
      const result = COMPARATORS[key](a, b);
      if (result !== 0) return result;
    }
    return a.code.localeCompare(b.code, 'id');
  });
}
