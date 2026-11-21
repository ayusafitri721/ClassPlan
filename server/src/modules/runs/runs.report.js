export const REPORT_LIMITATIONS = [
  'Kelompok warna adalah himpunan mata kuliah yang tidak berkonflik menurut model graf, bukan jadwal hari, jam, atau ruang.',
  'Mode konflik dosen hanya memeriksa kesamaan dosen pengampu. Konflik akibat kelompok mahasiswa belum dimodelkan.',
  'Laporan memakai snapshot data pada saat analisis dijalankan, sehingga perubahan data master tidak mengubah hasil lama.',
  'Welch Powell adalah heuristik. Jumlah warna belum tentu minimum kecuali sama dengan batas bawah yang terbukti.',
];

const pairKey = (a, b) => [a, b].sort().join('|');

export function buildReport(run) {
  const vertices = run.graphSnapshot?.vertices ?? [];
  const edges = run.graphSnapshot?.edges ?? [];
  const byCode = new Map(vertices.map((vertex) => [vertex.code, vertex]));
  const orderedStep = run.trace.find((step) => step.type === 'ORDERED');
  const validatedStep = run.trace.find((step) => step.type === 'VALIDATED');
  const order = orderedStep?.order ?? [];

  const edgeKeys = new Set(edges.map((edge) => pairKey(edge.u, edge.v)));
  const codes = order.map((item) => item.code);
  const matrix = codes.map((rowCode) =>
    codes.map((columnCode) =>
      rowCode === columnCode ? 0 : edgeKeys.has(pairKey(rowCode, columnCode)) ? 1 : 0
    )
  );

  const courses = order.map((item) => {
    const vertex = byCode.get(item.code);
    return {
      code: item.code,
      name: item.name,
      credits: item.credits,
      degree: item.degree,
      dayOfWeek: vertex?.dayOfWeek ?? null,
      startTime: vertex?.startTime ?? null,
      endTime: vertex?.endTime ?? null,
      lecturers: vertex?.lecturers ?? [],
    };
  });

  const degrees = [...vertices]
    .map((vertex) => ({
      code: vertex.code,
      name: vertex.name,
      degree: vertex.degree,
    }))
    .sort((a, b) => b.degree - a.degree || a.code.localeCompare(b.code, 'id'));

  return {
    meta: {
      runId: run.id,
      institutionName: run.settingsSnapshot?.institutionName ?? '',
      studyProgram: run.studyProgram,
      className: run.className,
      scopeLabel: run.scopeLabel || run.className,
      isCombined: Boolean(run.isCombined),
      academicYear: run.academicYear,
      term: run.term,
      conflictMode: run.conflictMode,
      tieBreakRule: run.tieBreakRule,
      createdAt: run.createdAt,
      generatedAt: new Date().toISOString(),
    },
    courses,
    edges,
    adjacency: { codes, matrix },
    degrees,
    order,
    coloring: run.results,
    groups: run.groups,
    validation: {
      status: run.validationStatus,
      isValid: validatedStep?.isValid ?? run.validationStatus === 'valid',
      conflicts: validatedStep?.conflicts ?? [],
      uncolored: validatedStep?.uncolored ?? [],
      colorCount: run.colorCount,
    },
    optimality: run.settingsSnapshot?.optimality ?? null,
    limitations: REPORT_LIMITATIONS,
  };
}

export function buildCsvRows(run) {
  return run.groups.flatMap((group) =>
    group.courses.map((course) => ({
      color: group.color,
      code: course.code,
      name: course.name,
      credits: course.credits,
      degree: course.degree,
      lecturers: (course.lecturers ?? []).map((lecturer) => lecturer.name).join('; '),
    }))
  );
}
