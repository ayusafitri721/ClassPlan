import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { pool, withTransaction } from './pool.js';

const classes = [
  { name: 'Kelas D', studyProgram: 'D3 Sistem Informasi', cohortYear: 2026 },
  { name: 'Kelas D', studyProgram: 'D3 Sistem Informasi', cohortYear: 2025 },
];

const semesters = [{ academicYear: '2026/2027', term: 'ganjil' }];

// Nama sudah dinormalisasi: gelar dibuang supaya dosen yang sama tidak
// tercatat dua kali. Dua nama di bawah juga dipakai oleh angkatan 2026.
const lecturers = [
  'Dr. Badruddin',
  'Dr. Mukhrij Sidqy',
  'Fajar Setyaning Dwi Putra',
  'Dr. Hasan Basri',
  'RR Octanty Mulianingtyas',
  'Dr. Mufid Nilmada',
  'Ir. Yuliana Yuli Wahyuningsih',
  'Dr. Ernalem Bangun',
  'Galih Prakoso Rizky A',
  'Rasenda',
  'Prof. Dr. Ermatita',
  'Dr. Desta Sandya Prasvita',
  'Intan Novita Dewi',
  'Bobby Suryo Prakoso',
  'Dr. Widya Cholil',
  'Dr. Suci Br Kembaren',
  'Edy Widarto',
  'Nur Hafifah Matondang',
  'Tri Rahayu',
  'Mardiah',
];

const coursesByCohort = {
  2026: [
    {
      code: 'PA',
      name: 'Pendidikan Agama',
      credits: 2,
      lecturers: ['Dr. Badruddin', 'Dr. Mukhrij Sidqy'],
    },
    {
      code: 'PC',
      name: 'Pancasila',
      credits: 2,
      lecturers: ['Fajar Setyaning Dwi Putra', 'Dr. Hasan Basri'],
    },
    {
      code: 'MD',
      name: 'Matematika Diskrit',
      credits: 3,
      lecturers: ['RR Octanty Mulianingtyas', 'Dr. Mufid Nilmada'],
    },
    {
      code: 'PBN',
      name: 'Pendidikan Bela Negara',
      credits: 2,
      lecturers: ['Ir. Yuliana Yuli Wahyuningsih', 'Dr. Ernalem Bangun'],
    },
    {
      code: 'DP',
      name: 'Dasar Pemrograman',
      credits: 2,
      lecturers: ['Galih Prakoso Rizky A'],
    },
    {
      code: 'PDP',
      name: 'Praktikum Dasar Pemrograman',
      credits: 2,
      lecturers: ['Galih Prakoso Rizky A'],
    },
    {
      code: 'KBD',
      name: 'Konsep Basis Data',
      credits: 2,
      lecturers: ['Rasenda', 'Prof. Dr. Ermatita'],
    },
    {
      code: 'PKBD',
      name: 'Praktikum Konsep Basis Data',
      credits: 2,
      lecturers: ['Rasenda'],
    },
    {
      code: 'SD',
      name: 'Struktur Data',
      credits: 1,
      lecturers: ['RR Octanty Mulianingtyas', 'Dr. Desta Sandya Prasvita'],
    },
    {
      code: 'PSD',
      name: 'Praktikum Struktur Data',
      credits: 2,
      lecturers: ['RR Octanty Mulianingtyas'],
    },
  ],
  2025: [
    {
      code: 'SP',
      name: 'Statistik dan Probabilitas',
      credits: 2,
      dayOfWeek: 'senin',
      startTime: '09:40',
      endTime: '12:10',
      lecturers: ['Intan Novita Dewi'],
    },
    {
      code: 'SO',
      name: 'Sistem Operasi',
      credits: 2,
      dayOfWeek: 'senin',
      startTime: '13:00',
      endTime: '13:50',
      lecturers: ['Bobby Suryo Prakoso', 'Dr. Widya Cholil'],
    },
    {
      code: 'PSO',
      name: 'Praktikum Sistem Operasi',
      credits: 1,
      dayOfWeek: 'senin',
      startTime: '13:50',
      endTime: '15:30',
      lecturers: ['Bobby Suryo Prakoso'],
    },
    {
      code: 'PW',
      name: 'Pemrograman Web',
      credits: 2,
      dayOfWeek: 'selasa',
      startTime: '13:00',
      endTime: '13:50',
      lecturers: ['Galih Prakoso Rizky A'],
    },
    {
      code: 'PPW',
      name: 'Praktikum Pemrograman Web',
      credits: 1,
      dayOfWeek: 'selasa',
      startTime: '13:50',
      endTime: '15:30',
      lecturers: ['Galih Prakoso Rizky A'],
    },
    {
      code: 'PDS',
      name: 'Pengantar Data Science',
      credits: 2,
      dayOfWeek: 'rabu',
      startTime: '10:30',
      endTime: '12:10',
      lecturers: ['RR Octanty Mulianingtyas'],
    },
    {
      code: 'TECH',
      name: 'Technopreneurship',
      credits: 2,
      dayOfWeek: 'kamis',
      startTime: '08:50',
      endTime: '10:30',
      lecturers: ['Nur Hafifah Matondang'],
    },
    {
      code: 'IMK1',
      name: 'Interaksi Manusia dan Komputer Sesi 1',
      credits: 2,
      dayOfWeek: 'kamis',
      startTime: '13:00',
      endTime: '13:50',
      lecturers: ['Galih Prakoso Rizky A', 'Dr. Suci Br Kembaren'],
    },
    {
      code: 'PTI-K',
      name: 'Pengantar Teknologi Informasi Sesi Kamis',
      credits: 2,
      dayOfWeek: 'kamis',
      startTime: '13:50',
      endTime: '15:30',
      lecturers: ['Bobby Suryo Prakoso', 'Edy Widarto'],
    },
    {
      code: 'IMK2',
      name: 'Interaksi Manusia dan Komputer Sesi 2',
      credits: 2,
      dayOfWeek: 'kamis',
      startTime: '15:30',
      endTime: '16:20',
      lecturers: ['Galih Prakoso Rizky A', 'Dr. Suci Br Kembaren'],
    },
    {
      code: 'PIMK',
      name: 'Praktikum Interaksi Manusia dan Komputer',
      credits: 1,
      dayOfWeek: 'kamis',
      startTime: '16:20',
      endTime: '18:00',
      lecturers: ['Galih Prakoso Rizky A'],
    },
    {
      code: 'PTI-J',
      name: 'Pengantar Teknologi Informasi Sesi Jumat',
      credits: 2,
      dayOfWeek: 'jumat',
      startTime: '08:00',
      endTime: '09:40',
      lecturers: ['Bobby Suryo Prakoso', 'Edy Widarto'],
    },
    {
      code: 'AB',
      name: 'Analisis Bisnis',
      credits: 2,
      dayOfWeek: 'jumat',
      startTime: '09:40',
      endTime: '11:20',
      lecturers: ['Tri Rahayu'],
    },
    {
      code: 'MPSI',
      name: 'Manajemen Proyek Sistem Informasi',
      credits: 2,
      dayOfWeek: 'jumat',
      startTime: '13:30',
      endTime: '15:10',
      lecturers: ['Mardiah'],
    },
  ],
};

async function seed() {
  const passwordHash = await bcrypt.hash(env.seedAdmin.password, 10);

  await withTransaction(async (client) => {
    await client.query(
      `insert into users (name, email, password_hash, role)
       values ($1, $2, $3, 'admin')
       on conflict (lower(email)) do update
         set name = excluded.name,
             password_hash = excluded.password_hash,
             role = 'admin'`,
      [env.seedAdmin.name, env.seedAdmin.email.toLowerCase(), passwordHash]
    );
    console.log(`[seed] admin: ${env.seedAdmin.email}`);

    const classIds = new Map();
    for (const item of classes) {
      const { rows } = await client.query(
        `insert into classes (name, study_program, cohort_year)
         values ($1, $2, $3)
         on conflict (name, study_program, cohort_year) do update set name = excluded.name
         returning id`,
        [item.name, item.studyProgram, item.cohortYear]
      );
      classIds.set(item.cohortYear, rows[0].id);
    }

    const semesterIds = [];
    for (const item of semesters) {
      const { rows } = await client.query(
        `insert into semesters (academic_year, term)
         values ($1, $2)
         on conflict (academic_year, term) do update set term = excluded.term
         returning id`,
        [item.academicYear, item.term]
      );
      semesterIds.push(rows[0].id);
    }

    const lecturerIds = new Map();
    for (const name of lecturers) {
      const existing = await client.query('select id from lecturers where name = $1', [name]);
      if (existing.rows[0]) {
        lecturerIds.set(name, existing.rows[0].id);
        continue;
      }
      const { rows } = await client.query(
        'insert into lecturers (name) values ($1) returning id',
        [name]
      );
      lecturerIds.set(name, rows[0].id);
    }

    let courseCount = 0;
    for (const [cohortYear, courses] of Object.entries(coursesByCohort)) {
      for (const course of courses) {
        const { rows } = await client.query(
          `insert into courses
             (code, name, credits, class_id, semester_id, day_of_week, start_time, end_time)
           values ($1, $2, $3, $4, $5, $6, $7, $8)
           on conflict (code, class_id, semester_id) do update
             set name = excluded.name,
                 credits = excluded.credits,
                 day_of_week = excluded.day_of_week,
                 start_time = excluded.start_time,
                 end_time = excluded.end_time
           returning id`,
          [
            course.code,
            course.name,
            course.credits,
            classIds.get(Number(cohortYear)),
            semesterIds[0],
            course.dayOfWeek ?? null,
            course.startTime ?? null,
            course.endTime ?? null,
          ]
        );

        for (const name of course.lecturers) {
          await client.query(
            `insert into course_lecturers (course_id, lecturer_id)
             values ($1, $2)
             on conflict (course_id, lecturer_id) do nothing`,
            [rows[0].id, lecturerIds.get(name)]
          );
        }
        courseCount += 1;
      }
    }

    await client.query(
      `insert into app_settings (id, institution_name, study_program, academic_year, term)
       values (1, $1, $2, $3, $4)
       on conflict (id) do nothing`,
      [
        'UPN "Veteran" Jakarta',
        'D3 Sistem Informasi',
        semesters[0].academicYear,
        semesters[0].term,
      ]
    );

    console.log(
      `[seed] ${classes.length} kelas, ${semesters.length} semester, ${lecturers.length} dosen, ${courseCount} mata kuliah`
    );
  });

  await pool.end();
}

seed().catch(async (error) => {
  console.error('[seed] gagal:', error.message);
  await pool.end();
  process.exit(1);
});
