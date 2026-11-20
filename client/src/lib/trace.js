export const STAGES = [
  { key: 'graph', label: 'Pembentukan graf', short: 'Graf' },
  { key: 'degree', label: 'Perhitungan derajat', short: 'Derajat' },
  { key: 'order', label: 'Pengurutan simpul', short: 'Urutan' },
  { key: 'color', label: 'Pewarnaan', short: 'Warna' },
  { key: 'validate', label: 'Validasi', short: 'Validasi' },
];

const STAGE_BY_TYPE = {
  GRAPH_BUILT: 'graph',
  DEGREES_COMPUTED: 'degree',
  ORDERED: 'order',
  COLOR_OPENED: 'color',
  VERTEX_COLORED: 'color',
  VERTEX_SKIPPED: 'color',
  COLOR_CLOSED: 'color',
  VALIDATED: 'validate',
};

export function deriveColoring(trace, index) {
  const colorOf = {};
  const log = [];
  let stage = 'graph';
  let colorCount = 0;
  let activeCode = null;

  const last = Math.min(index, trace.length - 1);

  for (let i = 0; i <= last; i += 1) {
    const step = trace[i];
    log.push(step);
    stage = STAGE_BY_TYPE[step.type] ?? stage;

    if (step.type === 'COLOR_OPENED') {
      colorOf[step.code] = step.color;
      colorCount = Math.max(colorCount, step.color);
      activeCode = step.code;
    }
    if (step.type === 'VERTEX_COLORED') {
      colorOf[step.code] = step.color;
      activeCode = step.code;
    }
    if (step.type === 'VERTEX_SKIPPED') activeCode = step.code;
    if (step.type === 'COLOR_CLOSED') activeCode = null;
  }

  return { colorOf, log, stage, colorCount, activeCode };
}

export function stageIndex(stageKey) {
  return STAGES.findIndex((stage) => stage.key === stageKey);
}

export function stepLabel(step) {
  if (!step) return 'Belum ada langkah.';

  switch (step.type) {
    case 'GRAPH_BUILT':
      return `Graf terbentuk dengan ${step.vertexCount} simpul dan ${step.edgeCount} sisi.`;
    case 'DEGREES_COMPUTED':
      return `Derajat ${step.degrees.length} simpul dihitung dari jumlah tetangga.`;
    case 'ORDERED':
      return `Urutan simpul: ${step.order.map((item) => item.code).join(', ')}.`;
    case 'COLOR_OPENED':
      return `Warna ${step.color} dibuka. Simpul pertama: ${step.code}.`;
    case 'VERTEX_COLORED':
      return `${step.code} menerima warna ${step.color}.`;
    case 'VERTEX_SKIPPED':
      return `${step.code} dilewati pada warna ${step.color} karena bertetangga dengan ${step.blockedBy.join(', ')}.`;
    case 'COLOR_CLOSED':
      return `Warna ${step.color} selesai dengan anggota ${step.members.join(', ')}.`;
    case 'VALIDATED':
      return step.isValid
        ? `Validasi lolos. Semua sisi menghubungkan warna berbeda, total ${step.colorCount} warna.`
        : 'Validasi gagal. Ada sisi yang menghubungkan dua simpul dengan warna sama.';
    default:
      return step.type;
  }
}
