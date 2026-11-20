import { pool } from '../../db/pool.js';
import { AppError, notFound } from '../../utils/errors.js';

const LECTURER_SQL = `
  select l.id,
         l.name,
         l.lecturer_code as "lecturerCode",
         coalesce(
           json_agg(
             json_build_object(
               'id', c.id,
               'code', c.code,
               'name', c.name,
               'classId', c.class_id,
               'semesterId', c.semester_id
             )
             order by c.code
           ) filter (where c.id is not null),
           '[]'::json
         ) as courses
  from lecturers l
  left join course_lecturers cl on cl.lecturer_id = l.id
  left join courses c on c.id = cl.course_id
`;

export async function listLecturers({ search = '' } = {}) {
  const params = [];
  let where = '';
  if (search) {
    params.push(`%${search}%`);
    where = `where (l.name ilike $1 or coalesce(l.lecturer_code, '') ilike $1)`;
  }

  const { rows } = await pool.query(
    `${LECTURER_SQL}
     ${where}
     group by l.id
     order by l.name`,
    params
  );
  return rows;
}

export async function getLecturerById(id) {
  const { rows } = await pool.query(
    `${LECTURER_SQL}
     where l.id = $1
     group by l.id`,
    [id]
  );
  if (!rows[0]) throw notFound('Dosen tidak ditemukan');
  return rows[0];
}

export async function createLecturer(input) {
  const { rows } = await pool.query(
    `insert into lecturers (name, lecturer_code)
     values ($1, $2)
     returning id`,
    [input.name, input.lecturerCode]
  );
  return getLecturerById(rows[0].id);
}

export async function updateLecturer(id, input) {
  const { rowCount } = await pool.query(
    `update lecturers
        set name = $1,
            lecturer_code = $2
      where id = $3`,
    [input.name, input.lecturerCode, id]
  );
  if (rowCount === 0) throw notFound('Dosen tidak ditemukan');
  return getLecturerById(id);
}

export async function deleteLecturer(id) {
  try {
    const { rowCount } = await pool.query('delete from lecturers where id = $1', [id]);
    if (rowCount === 0) throw notFound('Dosen tidak ditemukan');
  } catch (error) {
    if (error?.code === '23503') {
      throw new AppError(
        409,
        'IN_USE',
        'Dosen masih terhubung ke mata kuliah. Lepaskan relasinya terlebih dahulu.'
      );
    }
    throw error;
  }
}
