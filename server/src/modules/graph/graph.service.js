import { assertScopeExists, fetchScopeCourses } from '../../db/courseQueries.js';
import { buildGraph } from '../../algorithm/buildGraph.js';

export async function getGraphPreview({ classId, semesterId, conflictMode }) {
  await assertScopeExists(classId, semesterId);

  const courses = await fetchScopeCourses(classId, semesterId);
  const graph = buildGraph(courses, { mode: conflictMode });

  const vertices = [...graph.vertices].sort((a, b) => a.code.localeCompare(b.code, 'id'));

  return {
    classId,
    semesterId,
    conflictMode,
    vertexCount: vertices.length,
    edgeCount: graph.edges.length,
    isolatedCount: vertices.filter((vertex) => vertex.degree === 0).length,
    coursesWithoutLecturers: courses
      .filter((course) => course.lecturers.length === 0)
      .map((course) => course.code),
    vertices,
    edges: graph.edges,
  };
}
