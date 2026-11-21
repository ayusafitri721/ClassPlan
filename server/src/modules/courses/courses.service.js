import { pool, withTransaction } from '../../db/pool.js';
import { assertScopeExists } from '../../db/courseQueries.js';
import { AppError, notFound } from '../../utils/errors.js';

const COURSE_SQL = `
  select c.id,
         c.code,
         c.name,
         c.credits,
         c.class_id as "classId",
         c.semester_id as "semesterId",
         cl.name as "className",
         cl.cohort_year as "cohortYear",
         s.academic_year as "academicYear",
         s.term,
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
  join semesters s on s.id = c.semester_id
  left join course_lecturers cl2 on cl2.course_id = c.id
  left join lecturers l on l.id = cl2.lecturer_id
`;

async function assertLecturersExist(db, lecturerIds) {
  if (lecturerIds.length === 0) return;
  const { rows } = await db.query(
    'select id from lecturers where id = any($1::bigint[])',
    [lecturerIds]
  );
  if (rows.length !== lecturerIds.length) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Ada dosen yang tidak ditemukan', {
      lecturerIds: 'Pilih dosen yang masih ada',
    });
  }
}

async function replaceLecturers(db, courseId, lecturerIds) {
  await db.query('delete from course_lecturers where course_id = $1', [courseId]);
  if (lecturerIds.length === 0) return;
  await db.query(
    `insert into course_lecturers (course_id, lecturer_id)
     select $1, unnest($2::bigint[])
     on conflict (course_id, lecturer_id) do nothing`,
    [courseId, lecturerIds]
  );
}

export async function listCourses({ classId, semesterId, search = '' }) {
  const conditions = [];
  const params = [];

  if (classId) {
    params.push(classId);
    conditions.push(`c.class_id = $${params.length}`);
  }
  if (semesterId) {
    params.push(semesterId);
    conditions.push(`c.semester_id = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(c.code ilike $${params.length} or c.name ilike $${params.length})`);
  }

  const where = conditions.length ? `where ${conditions.join(' and ')}` : '';
  const { rows } = await pool.query(
    `${COURSE_SQL}
     ${where}
     group by c.id, cl.name, cl.cohort_year, s.academic_year, s.term
     order by c.code`,
    params
  );
  return rows;
}

export async function getCourseById(id, db = pool) {
  const { rows } = await db.query(
    `${COURSE_SQL}
     where c.id = $1
     group by c.id, cl.name, cl.cohort_year, s.academic_year, s.term`,
    [id]
  );
  if (!rows[0]) throw notFound('Mata kuliah tidak ditemukan');
  return rows[0];
}

export async function createCourse(input) {
  return withTransaction(async (client) => {
    await assertScopeExists(input.classId, input.semesterId, client);
    await assertLecturersExist(client, input.lecturerIds);

    const { rows } = await client.query(
      `insert into courses
         (code, name, credits, class_id, semester_id, day_of_week, start_time, end_time)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       returning id`,
      [
        input.code,
        input.name,
        input.credits,
        input.classId,
        input.semesterId,
        input.dayOfWeek ?? null,
        input.startTime ?? null,
        input.endTime ?? null,
      ]
    );

    await replaceLecturers(client, rows[0].id, input.lecturerIds);
    return getCourseById(rows[0].id, client);
  });
}

export async function updateCourse(id, input) {
  return withTransaction(async (client) => {
    await assertScopeExists(input.classId, input.semesterId, client);
    await assertLecturersExist(client, input.lecturerIds);

    const { rowCount } = await client.query(
      `update courses
          set code = $1,
              name = $2,
              credits = $3,
              class_id = $4,
              semester_id = $5,
              day_of_week = $6,
              start_time = $7,
              end_time = $8
        where id = $9`,
      [
        input.code,
        input.name,
        input.credits,
        input.classId,
        input.semesterId,
        input.dayOfWeek ?? null,
        input.startTime ?? null,
        input.endTime ?? null,
        id,
      ]
    );

    if (rowCount === 0) throw notFound('Mata kuliah tidak ditemukan');

    await replaceLecturers(client, id, input.lecturerIds);
    return getCourseById(id, client);
  });
}

export async function deleteCourse(id) {
  const { rowCount } = await pool.query('delete from courses where id = $1', [id]);
  if (rowCount === 0) throw notFound('Mata kuliah tidak ditemukan');
}

export async function setCourseLecturers(id, lecturerIds) {
  return withTransaction(async (client) => {
    const { rowCount } = await client.query('select 1 from courses where id = $1', [id]);
    if (rowCount === 0) throw notFound('Mata kuliah tidak ditemukan');

    await assertLecturersExist(client, lecturerIds);
    await replaceLecturers(client, id, lecturerIds);
    return getCourseById(id, client);
  });
}
