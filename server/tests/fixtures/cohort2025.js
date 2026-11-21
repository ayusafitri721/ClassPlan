const lecturer = (id, name) => ({ id, name });

const intan = lecturer(101, 'Intan Novita Dewi');
const bobby = lecturer(102, 'Bobby Suryo Prakoso');
const widya = lecturer(103, 'Dr. Widya Cholil');
const galih = lecturer(9, 'Galih Prakoso Rizky A');
const octanty = lecturer(5, 'RR Octanty Mulianingtyas');
const nur = lecturer(104, 'Nur Hafifah Matondang');
const suci = lecturer(105, 'Dr. Suci Br Kembaren');
const edy = lecturer(106, 'Edy Widarto');
const tri = lecturer(107, 'Tri Rahayu');
const mardiah = lecturer(108, 'Mardiah');

export const cohort2025Courses = [
  { id: 101, code: 'SP', name: 'Statistik dan Probabilitas', credits: 2, lecturers: [intan] },
  {
    id: 102,
    code: 'SO',
    name: 'Sistem Operasi',
    credits: 2,
    lecturers: [bobby, widya],
  },
  {
    id: 103,
    code: 'PSO',
    name: 'Praktikum Sistem Operasi',
    credits: 1,
    lecturers: [bobby],
  },
  { id: 104, code: 'PW', name: 'Pemrograman Web', credits: 2, lecturers: [galih] },
  {
    id: 105,
    code: 'PPW',
    name: 'Praktikum Pemrograman Web',
    credits: 1,
    lecturers: [galih],
  },
  {
    id: 106,
    code: 'PDS',
    name: 'Pengantar Data Science',
    credits: 2,
    lecturers: [octanty],
  },
  { id: 107, code: 'TECH', name: 'Technopreneurship', credits: 2, lecturers: [nur] },
  {
    id: 108,
    code: 'IMK1',
    name: 'Interaksi Manusia dan Komputer Sesi 1',
    credits: 2,
    lecturers: [galih, suci],
  },
  {
    id: 109,
    code: 'PTI-K',
    name: 'Pengantar Teknologi Informasi Sesi Kamis',
    credits: 2,
    lecturers: [bobby, edy],
  },
  {
    id: 110,
    code: 'IMK2',
    name: 'Interaksi Manusia dan Komputer Sesi 2',
    credits: 2,
    lecturers: [galih, suci],
  },
  {
    id: 111,
    code: 'PIMK',
    name: 'Praktikum Interaksi Manusia dan Komputer',
    credits: 1,
    lecturers: [galih],
  },
  {
    id: 112,
    code: 'PTI-J',
    name: 'Pengantar Teknologi Informasi Sesi Jumat',
    credits: 2,
    lecturers: [bobby, edy],
  },
  { id: 113, code: 'AB', name: 'Analisis Bisnis', credits: 2, lecturers: [tri] },
  {
    id: 114,
    code: 'MPSI',
    name: 'Manajemen Proyek Sistem Informasi',
    credits: 2,
    lecturers: [mardiah],
  },
];
