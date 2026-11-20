export function welshPowell(order, adjacency) {
  const colorOf = new Map();
  const groups = [];
  const steps = [];
  let colorCount = 0;

  while (colorOf.size < order.length) {
    const seed = order.find((vertex) => !colorOf.has(vertex.code));
    if (!seed) break;

    colorCount += 1;
    const members = [seed.code];
    colorOf.set(seed.code, colorCount);
    steps.push({ type: 'COLOR_OPENED', color: colorCount, code: seed.code });

    for (const vertex of order) {
      if (vertex.code === seed.code) continue;
      if (colorOf.has(vertex.code)) continue;

      const blockedBy = members.filter((member) => adjacency.get(member)?.has(vertex.code));
      if (blockedBy.length > 0) {
        steps.push({
          type: 'VERTEX_SKIPPED',
          color: colorCount,
          code: vertex.code,
          blockedBy,
        });
        continue;
      }

      colorOf.set(vertex.code, colorCount);
      members.push(vertex.code);
      steps.push({ type: 'VERTEX_COLORED', color: colorCount, code: vertex.code });
    }

    groups.push({ color: colorCount, members });
    steps.push({ type: 'COLOR_CLOSED', color: colorCount, members });
  }

  return { colorOf, groups, colorCount, steps };
}
