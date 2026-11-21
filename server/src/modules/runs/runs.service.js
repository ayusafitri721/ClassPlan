import { LIMITS } from '@classplan/shared';
import { pool, withTransaction } from '../../db/pool.js';
import {
  assertScopesExist,
  fetchScopeCourses,
  normalizeClassIds,
} from '../../db/courseQueries.js';
import { analyze } from '../../algorithm/analyze.js';
import { AppError, notFound, unprocessable } from '../../utils/errors.js';
import { getSettings } from '../settings/settings.service.js';
import { buildCsvRows, buildReport } from './runs.report.js';
import { toCsv } from '../../utils/csv.js';

const RUN_SQL = `
  select r.id,
         r.class_id as "classId",
         r.semester_id as "semesterId",
         cl.name as "className",
         cl.cohort_year as "cohortYear",
         cl.study_program as "studyProgram",
         s.academic_year as "academicYear",
         s.term,
         r.conflict_mode as "conflictMode",
         r.tie_break_rule as "tieBreakRule",
         r.scope_label as "scopeLabel",
         r.is_combined as "isCombined",
         r.status,
         r.vertex_count as "vertexCount",
         r.edge_count as "edgeCount",
         r.color_count as "colorCount",
         r.validation_status as "validationStatus",
         r.graph_snapshot as "graphSnapshot",
         r.trace,
         r.settings_snapshot as "settingsSnapshot",
         r.created_at as "createdAt"
    from scheduling_runs r
    join classes cl on cl.id = r.class_id
    join semesters s on s.id = r.semester_id
`;

function buildScopeLabel(courses) {
  const cohorts = [...new Set(courses.map((course) => course.cohortYear))]
    .filter(Boolean)
    .sort((a, b) => a - b);
  const name = courses[0]?.className ?? 'Kelas';

  if (cohorts.length <= 1) return `${name} – Angkatan ${cohorts[0] ?? '-'}`;
  return `${name} – Angkatan ${cohorts.join(' + ')} (Gabungan)`;
}

// Kode mata kuliah harus unik di dalam satu graf. Kalau dua kelas memakai
// kode yang sama, beri akhiran angkatan pada snapshot dan hasilnya.
function disambiguateCodes(courses) {
  const counts = new Map();
  for (const course of courses) {
    counts.set(course.code, (counts.get(course.code) ?? 0) + 1);
  }
  return courses.map((course) =>
    counts.get(course.code) > 1
      ? { ...course, code: `${course.code}-${course.cohortYear}` }
      : course
  );
}

export async function createRun({
  classId,
  classIds,
  semesterId,
  conflictMode,
  tieBreakRule,
  userId,
}) {
  const ids = normalizeClassIds(classId, classIds);
  await assertScopesExist(ids, semesterId);

  const courses = disambiguateCodes(await fetchScopeCourses(ids, semesterId));

  if (courses.length === 0) {
    throw unprocessable(
      'EMPTY_SCOPE',
      'Belum ada mata kuliah pada kelas dan semester ini. Tambahkan data terlebih dahulu.'
    );
  }

  if (courses.length > LIMITS.maxCoursesPerRun) {
    throw unprocessable(
      'TOO_MANY_COURSES',
      `Analisis dibatasi ${LIMITS.maxCoursesPerRun} mata kuliah per proses.`
    );
  }

  const withoutLecturers = courses
    .filter((course) => course.lecturers.length === 0)
    .map((course) => course.code);

  if (withoutLecturers.length > 0) {
    throw unprocessable(
      'INCOMPLETE_DATA',
      'Mode konflik dosen membutuhkan minimal satu dosen pengampu untuk setiap mata kuliah.',
      { coursesWithoutLecturers: withoutLecturers }
    );
  }

  const settings = await getSettings();
  const analysis = analyze({ courses, conflictMode, tieBreakRule });

  if (!analysis.validation.isValid) {
    throw new AppError(
      500,
      'INVALID_RESULT',
      'Hasil pewarnaan gagal divalidasi. Periksa kembali data mata kuliah dan dosen.'
    );
  }

  const graphSnapshot = {
    vertices: analysis.graph.vertices,
    edges: analysis.graph.edges,
  };

  const settingsSnapshot = {
    institutionName: settings.institutionName,
    studyProgram: settings.studyProgram,
    academicYear: settings.academicYear,
    term: settings.term,
    tieBreakRule,
    optimality: analysis.optimality,
    appVersion: '0.1.0',
  };

  const scopeLabel = buildScopeLabel(courses);

  const runId = await withTransaction(async (client) => {
    const { rows } = await client.query(
      `insert into scheduling_runs
         (class_id, semester_id, conflict_mode, tie_break_rule, status,
          vertex_count, edge_count, color_count, validation_status,
          graph_snapshot, trace, settings_snapshot, created_by,
          scope_label, is_combined)
       values ($1, $2, $3, $4::jsonb, 'completed', $5, $6, $7, $8,
               $9::jsonb, $10::jsonb, $11::jsonb, $12, $13, $14)
       returning id`,
      [
        ids[0],
        semesterId,
        conflictMode,
        JSON.stringify(tieBreakRule),
        analysis.graph.vertices.length,
        analysis.graph.edges.length,
        analysis.validation.colorCount,
        analysis.validation.isValid ? 'valid' : 'invalid',
        JSON.stringify(graphSnapshot),
        JSON.stringify(analysis.trace),
        JSON.stringify(settingsSnapshot),
        userId ?? null,
        scopeLabel,
        ids.length > 1,
      ]
    );

    for (const id of ids) {
      await client.query(
        'insert into run_scopes (run_id, class_id) values ($1, $2)',
        [rows[0].id, id]
      );
    }

    const vertices = analysis.graph.vertices;
    await client.query(
      `insert into schedule_results
         (run_id, course_id, course_code, course_name, color_number)
       select * from unnest($1::bigint[], $2::bigint[], $3::text[], $4::text[], $5::int[])`,
      [
        vertices.map(() => rows[0].id),
        vertices.map((vertex) => vertex.id),
        vertices.map((vertex) => vertex.code),
        vertices.map((vertex) => vertex.name),
        vertices.map((vertex) => analysis.coloring.colorOf.get(vertex.code)),
      ]
    );

    return rows[0].id;
  });

  return getRunById(runId);
}

export async function listRuns({ classId, classIds, semesterId }) {
  const conditions = [];
  const params = [];
  const ids = normalizeClassIds(classId, classIds).filter(Boolean);

  if (ids.length) {
    params.push(ids);
    conditions.push(
      `(r.class_id = any($${params.length}::bigint[])
        or exists (select 1 from run_scopes rs
                    where rs.run_id = r.id and rs.class_id = any($${params.length}::bigint[])))`
    );
  }
  if (semesterId) {
    params.push(semesterId);
    conditions.push(`r.semester_id = $${params.length}`);
  }

  const where = conditions.length ? `where ${conditions.join(' and ')}` : '';
  const { rows } = await pool.query(
    `select r.id,
            r.class_id as "classId",
            r.semester_id as "semesterId",
            cl.name as "className",
            s.academic_year as "academicYear",
            s.term,
            r.conflict_mode as "conflictMode",
            r.scope_label as "scopeLabel",
            r.is_combined as "isCombined",
            r.vertex_count as "vertexCount",
            r.edge_count as "edgeCount",
            r.color_count as "colorCount",
            r.validation_status as "validationStatus",
            r.created_at as "createdAt",
            r.settings_snapshot -> 'optimality' as optimality
       from scheduling_runs r
       join classes cl on cl.id = r.class_id
       join semesters s on s.id = r.semester_id
       ${where}
      order by r.created_at desc
      limit 30`,
    params
  );
  return rows;
}

export async function getRunById(id) {
  const { rows } = await pool.query(`${RUN_SQL} where r.id = $1`, [id]);
  const run = rows[0];
  if (!run) throw notFound('Proses analisis tidak ditemukan');

  const [resultQuery, scopeRows] = await Promise.all([
    pool.query(
      `select course_code as code, course_name as name, color_number as color
         from schedule_results
        where run_id = $1
        order by color_number, course_code`,
      [id]
    ),
    pool.query('select class_id from run_scopes where run_id = $1 order by class_id', [id]),
  ]);

  const classIds = scopeRows.rows.map((row) => row.class_id);
  const byCode = new Map(
    (run.graphSnapshot?.vertices ?? []).map((vertex) => [vertex.code, vertex])
  );

  const groups = [];
  for (const row of resultQuery.rows) {
    let group = groups.find((item) => item.color === row.color);
    if (!group) {
      group = { color: row.color, totalCredits: 0, courses: [] };
      groups.push(group);
    }
    const vertex = byCode.get(row.code);
    const course = {
      code: row.code,
      name: row.name,
      credits: vertex?.credits ?? 0,
      degree: vertex?.degree ?? 0,
      lecturers: vertex?.lecturers ?? [],
    };
    group.courses.push(course);
    group.totalCredits += course.credits;
  }

  return {
    ...run,
    classIds: classIds.length ? classIds : [run.classId],
    results: resultQuery.rows,
    groups,
  };
}

export async function getRunReport(id) {
  const run = await getRunById(id);
  return buildReport(run);
}

export async function getRunCsv(id) {
  const run = await getRunById(id);
  const columns = [
    { key: 'color', label: 'Kelompok' },
    { key: 'code', label: 'Kode' },
    { key: 'name', label: 'Mata Kuliah' },
    { key: 'credits', label: 'SKS' },
    { key: 'degree', label: 'Derajat' },
    { key: 'lecturers', label: 'Dosen' },
  ];
  return toCsv(columns, buildCsvRows(run));
}
