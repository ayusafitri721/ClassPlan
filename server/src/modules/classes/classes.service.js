import { pool } from '../../db/pool.js';
import { AppError, notFound } from '../../utils/errors.js';

export async function listClasses() {
  const { rows } = await pool.query(`
    select cl.id,
           cl.name,
           cl.study_program as "studyProgram",
           count(c.id)::int as "courseCount"
      from classes cl
      left join courses c on c.class_id = cl.id
     group by cl.id
     order by cl.name
  `);
  return rows;
}

async function getClassById(id) {
  const { rows } = await pool.query(
    `select cl.id, cl.name, cl.study_program as "studyProgram"
       from classes cl
      where cl.id = $1`,
    [id]
  );
  if (!rows[0]) throw notFound('Kelas tidak ditemukan');
  return rows[0];
}

export async function createClass(input) {
  const { rows } = await pool.query(
    `insert into classes (name, study_program)
     values ($1, $2)
     returning id`,
    [input.name, input.studyProgram]
  );
  return getClassById(rows[0].id);
}

export async function updateClass(id, input) {
  const { rowCount } = await pool.query(
    `update classes
        set name = $1,
            study_program = $2
      where id = $3`,
    [input.name, input.studyProgram, id]
  );
  if (rowCount === 0) throw notFound('Kelas tidak ditemukan');
  return getClassById(id);
}

export async function deleteClass(id) {
  try {
    const { rowCount } = await pool.query('delete from classes where id = $1', [id]);
    if (rowCount === 0) throw notFound('Kelas tidak ditemukan');
  } catch (error) {
    if (error?.code === '23503') {
      throw new AppError(
        409,
        'IN_USE',
        'Kelas masih memiliki mata kuliah atau riwayat analisis.'
      );
    }
    throw error;
  }
}
