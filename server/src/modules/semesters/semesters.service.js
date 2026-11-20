import { pool } from '../../db/pool.js';
import { AppError, notFound } from '../../utils/errors.js';

export async function listSemesters() {
  const { rows } = await pool.query(`
    select s.id,
           s.academic_year as "academicYear",
           s.term,
           count(c.id)::int as "courseCount"
      from semesters s
      left join courses c on c.semester_id = s.id
     group by s.id
     order by s.academic_year desc, s.term
  `);
  return rows;
}

async function getSemesterById(id) {
  const { rows } = await pool.query(
    `select id, academic_year as "academicYear", term
       from semesters
      where id = $1`,
    [id]
  );
  if (!rows[0]) throw notFound('Semester tidak ditemukan');
  return rows[0];
}

export async function createSemester(input) {
  const { rows } = await pool.query(
    `insert into semesters (academic_year, term)
     values ($1, $2)
     returning id`,
    [input.academicYear, input.term]
  );
  return getSemesterById(rows[0].id);
}

export async function updateSemester(id, input) {
  const { rowCount } = await pool.query(
    `update semesters
        set academic_year = $1,
            term = $2
      where id = $3`,
    [input.academicYear, input.term, id]
  );
  if (rowCount === 0) throw notFound('Semester tidak ditemukan');
  return getSemesterById(id);
}

export async function deleteSemester(id) {
  try {
    const { rowCount } = await pool.query('delete from semesters where id = $1', [id]);
    if (rowCount === 0) throw notFound('Semester tidak ditemukan');
  } catch (error) {
    if (error?.code === '23503') {
      throw new AppError(
        409,
        'IN_USE',
        'Semester masih memiliki mata kuliah atau riwayat analisis.'
      );
    }
    throw error;
  }
}
