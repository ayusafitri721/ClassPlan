import { CONFLICT_MODE } from '@classplan/shared';

function sharedLecturers(a, b) {
  const ids = new Set((b.lecturers ?? []).map((lecturer) => lecturer.id));
  return (a.lecturers ?? []).filter((lecturer) => ids.has(lecturer.id));
}

export function buildGraph(courses, { mode = CONFLICT_MODE.LECTURER } = {}) {
  if (mode !== CONFLICT_MODE.LECTURER) {
    throw new Error(`Mode konflik ${mode} belum didukung`);
  }

  const codes = new Set();
  for (const course of courses) {
    if (codes.has(course.code)) {
      throw new Error(`Kode mata kuliah ganda pada satu scope: ${course.code}`);
    }
    codes.add(course.code);
  }

  const adjacency = new Map(courses.map((course) => [course.code, new Set()]));
  const edges = [];

  for (let i = 0; i < courses.length; i += 1) {
    for (let j = i + 1; j < courses.length; j += 1) {
      const a = courses[i];
      const b = courses[j];
      const shared = sharedLecturers(a, b);
      if (shared.length === 0) continue;

      edges.push({
        id: `${a.code}--${b.code}`,
        u: a.code,
        v: b.code,
        reason: {
          type: 'lecturer',
          lecturerIds: shared.map((lecturer) => lecturer.id),
          lecturerNames: shared.map((lecturer) => lecturer.name),
        },
      });
      adjacency.get(a.code).add(b.code);
      adjacency.get(b.code).add(a.code);
    }
  }

  const vertices = courses.map((course) => ({
    ...course,
    degree: adjacency.get(course.code).size,
  }));

  return { vertices, edges, adjacency };
}
