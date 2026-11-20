import { pool } from './pool.js';
import { badRequest } from '../utils/errors.js';

const SCOPE_COURSE_SQL = `
  select c.id,
         c.code,
         c.name,
         c.credits,
         c.class_id as "classId",
         c.semester_id as "semesterId",
         coalesce(
           json_agg(
             json_build_object('id', l.id, 'name', l.name, 'lecturerCode', l.lecturer_code)
             order by l.name
           ) filter (where l.id is not null),
           '[]'::json
         ) as lecturers
  from courses c
  left join course_lecturers cl on cl.course_id = c.id
  left join lecturers l on l.id = cl.lecturer_id
`;

export async function fetchScopeCourses(classId, semesterId, db = pool) {
  const { rows } = await db.query(
    `${SCOPE_COURSE_SQL}
     where c.class_id = $1 and c.semester_id = $2
     group by c.id
     order by c.code`,
    [classId, semesterId]
  );
  return rows;
}

export async function assertScopeExists(classId, semesterId, db = pool) {
  const { rows } = await db.query(
    `select exists(select 1 from classes where id = $1) as class_exists,
            exists(select 1 from semesters where id = $2) as semester_exists`,
    [classId, semesterId]
  );

  if (!rows[0].class_exists || !rows[0].semester_exists) {
    throw badRequest('Kelas atau semester tidak ditemukan', {
      ...(rows[0].class_exists ? {} : { classId: 'Kelas tidak ditemukan' }),
      ...(rows[0].semester_exists ? {} : { semesterId: 'Semester tidak ditemukan' }),
    });
  }
}
