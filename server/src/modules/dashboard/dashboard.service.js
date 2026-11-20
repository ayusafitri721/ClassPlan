import { pool } from '../../db/pool.js';
import { fetchScopeCourses, assertScopeExists } from '../../db/courseQueries.js';
import { buildGraph } from '../../algorithm/buildGraph.js';
import { badRequest } from '../../utils/errors.js';

export async function getDashboard({ classId, semesterId }) {
  if (!classId || !semesterId) {
    throw badRequest('Pilih kelas dan semester terlebih dahulu', {
      classId: 'Kelas wajib dipilih',
      semesterId: 'Semester wajib dipilih',
    });
  }

  await assertScopeExists(classId, semesterId);

  const [courses, lecturerResult, lastRunResult] = await Promise.all([
    fetchScopeCourses(classId, semesterId),
    pool.query('select count(*)::int as count from lecturers'),
    pool.query(
      `select r.id,
              r.vertex_count as "vertexCount",
              r.edge_count as "edgeCount",
              r.color_count as "colorCount",
              r.validation_status as "validationStatus",
              r.conflict_mode as "conflictMode",
              r.created_at as "createdAt",
              r.settings_snapshot -> 'optimality' as optimality
         from scheduling_runs r
        where r.class_id = $1 and r.semester_id = $2
        order by r.created_at desc
        limit 1`,
      [classId, semesterId]
    ),
  ]);

  const graph = courses.length
    ? buildGraph(courses)
    : { vertices: [], edges: [], adjacency: new Map() };

  const lastRunRow = lastRunResult.rows[0];
  let lastRun = null;

  if (lastRunRow) {
    const { rows } = await pool.query(
      `select color_number as color, course_code as code
         from schedule_results
        where run_id = $1
        order by color_number, course_code`,
      [lastRunRow.id]
    );

    const groups = [];
    for (const row of rows) {
      let group = groups.find((item) => item.color === row.color);
      if (!group) {
        group = { color: row.color, courses: [] };
        groups.push(group);
      }
      group.courses.push(row.code);
    }

    lastRun = { ...lastRunRow, groups };
  }

  return {
    courseCount: courses.length,
    lecturerCount: lecturerResult.rows[0].count,
    vertexCount: graph.vertices.length,
    edgeCount: graph.edges.length,
    isolatedCount: graph.vertices.filter((vertex) => vertex.degree === 0).length,
    coursesWithoutLecturers: courses
      .filter((course) => course.lecturers.length === 0)
      .map((course) => course.code),
    canRun: courses.length > 0 && courses.every((course) => course.lecturers.length > 0),
    lastRun,
  };
}
