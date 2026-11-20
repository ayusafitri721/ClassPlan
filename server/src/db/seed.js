import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { pool, withTransaction } from './pool.js';

const classes = [
  { name: 'Kelas D', studyProgram: 'D3 Sistem Informasi' },
];

const semesters = [{ academicYear: '2026/2027', term: 'ganjil' }];

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
];

const courses = [
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
];

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

    const classIds = [];
    for (const item of classes) {
      const { rows } = await client.query(
        `insert into classes (name, study_program)
         values ($1, $2)
         on conflict (name, study_program) do update set name = excluded.name
         returning id`,
        [item.name, item.studyProgram]
      );
      classIds.push(rows[0].id);
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

    for (const course of courses) {
      const { rows } = await client.query(
        `insert into courses (code, name, credits, class_id, semester_id)
         values ($1, $2, $3, $4, $5)
         on conflict (code, class_id, semester_id) do update
           set name = excluded.name, credits = excluded.credits
         returning id`,
        [course.code, course.name, course.credits, classIds[0], semesterIds[0]]
      );

      for (const name of course.lecturers) {
        await client.query(
          `insert into course_lecturers (course_id, lecturer_id)
           values ($1, $2)
           on conflict (course_id, lecturer_id) do nothing`,
          [rows[0].id, lecturerIds.get(name)]
        );
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

    console.log(`[seed] ${classes.length} kelas, ${semesters.length} semester, ${lecturers.length} dosen, ${courses.length} mata kuliah`);
  });

  await pool.end();
}

seed().catch(async (error) => {
  console.error('[seed] gagal:', error.message);
  await pool.end();
  process.exit(1);
});
