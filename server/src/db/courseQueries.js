import { pool } from './pool.js';
import { badRequest } from '../utils/errors.js';

const SCOPE_COURSE_SQL = `
  select c.id,
         c.code,
         c.name,
         c.credits,
         c.class_id as "classId",
         c.semester_id as "semesterId",
         cl.name as "className",
         cl.cohort_year as "cohortYear",
         c.day_of_week as "dayOfWeek",
         c.start_time as "startTime",
         c.end_time as "endTime",
         coalesce(
           json_agg(
             json_build_object('id', l.id, 'name', l.name, 'lecturerCode', l.lecturer_code)
             order by l.name
           ) filter (where l.id is not null),
           '[]'::json
         ) as lecturers
  from courses c
  join classes cl on cl.id = c.class_id
  left join course_lecturers cl2 on cl2.course_id = c.id
  left join lecturers l on l.id = cl2.lecturer_id
`;

export function normalizeClassIds(classId, classIds) {
  const requested = Array.isArray(classIds) && classIds.length ? classIds : [classId];
  return [...new Set(requested.filter(Boolean).map(Number))];
}

export async function fetchScopeCourses(classIds, semesterId, db = pool) {
  const ids = Array.isArray(classIds) ? classIds : [classIds];
  const { rows } = await db.query(
    `${SCOPE_COURSE_SQL}
      where c.class_id = any($1::bigint[]) and c.semester_id = $2
      group by c.id, cl.name, cl.cohort_year
      order by c.code`,
    [ids, semesterId]
  );
  return rows;
}

export async function assertScopesExist(classIds, semesterId, db = pool) {
  const ids = Array.isArray(classIds) ? classIds : [classIds];
  const { rows } = await db.query(
    `select (select count(*)::int from classes where id = any($1::bigint[])) as class_count,
            exists(select 1 from semesters where id = $2) as semester_exists`,
    [ids, semesterId]
  );

  const classExists = rows[0].class_count === ids.length;
  if (!classExists || !rows[0].semester_exists) {
    throw badRequest('Kelas atau semester tidak ditemukan', {
      ...(classExists ? {} : { classId: 'Salah satu kelas tidak ditemukan' }),
      ...(rows[0].semester_exists ? {} : { semesterId: 'Semester tidak ditemukan' }),
    });
  }
}

// Dipakai oleh modul lama yang hanya menerima satu kelas.
export const assertScopeExists = (classId, semesterId, db = pool) =>
  assertScopesExist([classId], semesterId, db);
