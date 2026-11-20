export function circularLayout(
  vertices,
  { radiusX, radiusY, center = { x: 420, y: 300 } } = {}
) {
  const count = vertices.length;
  const rx = radiusX ?? Math.max(250, count * 34);
  const ry = radiusY ?? Math.max(170, count * 19);

  return vertices.map((vertex, index) => {
    const angle = (2 * Math.PI * index) / Math.max(count, 1) - Math.PI / 2;
    return {
      x: center.x + rx * Math.cos(angle) - 84,
      y: center.y + ry * Math.sin(angle) - 32,
    };
  });
}
