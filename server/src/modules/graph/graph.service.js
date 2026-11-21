import {
  assertScopesExist,
  fetchScopeCourses,
  normalizeClassIds,
} from '../../db/courseQueries.js';
import { buildGraph } from '../../algorithm/buildGraph.js';

export async function getGraphPreview({ classId, classIds, semesterId, conflictMode }) {
  const ids = normalizeClassIds(classId, classIds);
  await assertScopesExist(ids, semesterId);

  const courses = await fetchScopeCourses(ids, semesterId);
  const graph = buildGraph(courses, { mode: conflictMode });

  const vertices = [...graph.vertices].sort((a, b) => a.code.localeCompare(b.code, 'id'));

  return {
    classIds: ids,
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
