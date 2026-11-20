function escapeCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\r\n;]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export function toCsv(columns, rows) {
  const header = columns.map((column) => escapeCell(column.label)).join(',');
  const body = rows
    .map((row) => columns.map((column) => escapeCell(row[column.key])).join(','))
    .join('\r\n');
  return `\uFEFF${header}\r\n${body}\r\n`;
}
