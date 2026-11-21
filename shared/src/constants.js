export const CONFLICT_MODE = {
  LECTURER: 'lecturer',
  LECTURER_CLASS: 'lecturer_class',
};

export const CONFLICT_MODE_LABEL = {
  [CONFLICT_MODE.LECTURER]: 'Konflik dosen',
  [CONFLICT_MODE.LECTURER_CLASS]: 'Konflik dosen dan kelas',
};

export const ACTIVE_CONFLICT_MODES = [CONFLICT_MODE.LECTURER];

export const TIE_BREAK = {
  DEGREE_DESC: 'degree_desc',
  CREDITS_DESC: 'credits_desc',
  COURSE_CODE_ASC: 'course_code_asc',
};

export const TIE_BREAK_LABEL = {
  [TIE_BREAK.DEGREE_DESC]: 'Derajat menurun',
  [TIE_BREAK.CREDITS_DESC]: 'SKS menurun',
  [TIE_BREAK.COURSE_CODE_ASC]: 'Kode mata kuliah menaik',
};

export const TIE_BREAK_RULE_OPTIONS = [
  {
    value: 'degree_credits_code',
    label: 'Derajat, SKS, lalu kode',
    rule: [TIE_BREAK.DEGREE_DESC, TIE_BREAK.CREDITS_DESC, TIE_BREAK.COURSE_CODE_ASC],
  },
  {
    value: 'degree_code',
    label: 'Derajat, lalu kode',
    rule: [TIE_BREAK.DEGREE_DESC, TIE_BREAK.COURSE_CODE_ASC],
  },
];

export const DEFAULT_TIE_BREAK_RULE = [
  TIE_BREAK.DEGREE_DESC,
  TIE_BREAK.CREDITS_DESC,
  TIE_BREAK.COURSE_CODE_ASC,
];

export const DAY = {
  SENIN: 'senin',
  SELASA: 'selasa',
  RABU: 'rabu',
  KAMIS: 'kamis',
  JUMAT: 'jumat',
};

export const DAY_LABEL = {
  [DAY.SENIN]: 'Senin',
  [DAY.SELASA]: 'Selasa',
  [DAY.RABU]: 'Rabu',
  [DAY.KAMIS]: 'Kamis',
  [DAY.JUMAT]: 'Jumat',
};

export const TERM = {
  GANJIL: 'ganjil',
  GENAP: 'genap',
};

export const TERM_LABEL = {
  [TERM.GANJIL]: 'Ganjil',
  [TERM.GENAP]: 'Genap',
};

export const LIMITS = {
  maxCoursesPerRun: 200,
  searchLength: 80,
};

export const CONFLICT_MODE_EXPLANATION = {
  [CONFLICT_MODE.LECTURER]:
    'Dua mata kuliah dihubungkan bila memiliki minimal satu dosen pengampu yang sama.',
  [CONFLICT_MODE.LECTURER_CLASS]:
    'Belum aktif. Membutuhkan data kelompok mahasiswa dan slot waktu, karena seluruh mata kuliah satu kelas pada semester yang sama akan saling berkonflik.',
};
