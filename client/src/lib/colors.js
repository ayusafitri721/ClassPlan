export const GROUP_PALETTE = [
  { name: 'Biru', tint: '#e8effc', ink: '#17306b', line: '#1d4ed8' },
  { name: 'Teal', tint: '#e7f5f1', ink: '#0f4f45', line: '#0f766e' },
  { name: 'Amber', tint: '#fdf1de', ink: '#6b3b06', line: '#b45309' },
  { name: 'Violet', tint: '#f1eafe', ink: '#4a1d8f', line: '#6d28d9' },
  { name: 'Rose', tint: '#fbe9ee', ink: '#7a1230', line: '#be123c' },
  { name: 'Sian', tint: '#e6f3f7', ink: '#0b4e5e', line: '#0e7490' },
  { name: 'Hijau', tint: '#eef4de', ink: '#3f4f12', line: '#4d7c0f' },
  { name: 'Cokelat', tint: '#f8efd9', ink: '#5c420a', line: '#a16207' },
];

export const NEUTRAL_NODE = {
  name: 'Netral',
  tint: '#ffffff',
  ink: '#0f172a',
  line: '#94a3b8',
};

export function groupStyle(color) {
  if (!color) return NEUTRAL_NODE;
  return GROUP_PALETTE[(color - 1) % GROUP_PALETTE.length];
}
