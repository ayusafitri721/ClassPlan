const lecturers = {
  badruddin: { id: 1, name: 'Dr. Badruddin' },
  mukhrij: { id: 2, name: 'Dr. Mukhrij Sidqy' },
  fajar: { id: 3, name: 'Fajar Setyaning Dwi Putra' },
  hasan: { id: 4, name: 'Dr. Hasan Basri' },
  octanty: { id: 5, name: 'RR Octanty Mulianingtyas' },
  mufid: { id: 6, name: 'Dr. Mufid Nilmada' },
  yuliana: { id: 7, name: 'Ir. Yuliana Yuli Wahyuningsih' },
  ernalem: { id: 8, name: 'Dr. Ernalem Bangun' },
  galih: { id: 9, name: 'Galih Prakoso Rizky A' },
  rasenda: { id: 10, name: 'Rasenda' },
 ermatita: { id: 11, name: 'Prof. Dr. Ermatita' },
  desta: { id: 12, name: 'Dr. Desta Sandya Prasvita' },
};

export const caseStudyCourses = [
  {
    id: 1,
    code: 'PA',
    name: 'Pendidikan Agama',
    credits: 2,
    lecturers: [lecturers.badruddin, lecturers.mukhrij],
  },
  {
    id: 2,
    code: 'PC',
    name: 'Pancasila',
    credits: 2,
    lecturers: [lecturers.fajar, lecturers.hasan],
  },
  {
    id: 3,
    code: 'MD',
    name: 'Matematika Diskrit',
    credits: 3,
    lecturers: [lecturers.octanty, lecturers.mufid],
  },
  {
    id: 4,
    code: 'PBN',
    name: 'Pendidikan Bela Negara',
    credits: 2,
    lecturers: [lecturers.yuliana, lecturers.ernalem],
  },
  {
    id: 5,
    code: 'DP',
    name: 'Dasar Pemrograman',
    credits: 2,
    lecturers: [lecturers.galih],
  },
  {
    id: 6,
    code: 'PDP',
    name: 'Praktikum Dasar Pemrograman',
    credits: 2,
    lecturers: [lecturers.galih],
  },
  {
    id: 7,
    code: 'KBD',
    name: 'Konsep Basis Data',
    credits: 2,
    lecturers: [lecturers.rasenda, lecturers.ermatita],
  },
  {
    id: 8,
    code: 'PKBD',
    name: 'Praktikum Konsep Basis Data',
    credits: 2,
    lecturers: [lecturers.rasenda],
  },
  {
    id: 9,
    code: 'SD',
    name: 'Struktur Data',
    credits: 1,
    lecturers: [lecturers.octanty, lecturers.desta],
  },
  {
    id: 10,
    code: 'PSD',
    name: 'Praktikum Struktur Data',
    credits: 2,
    lecturers: [lecturers.octanty],
  },
];

export const caseStudyLecturers = Object.values(lecturers);
