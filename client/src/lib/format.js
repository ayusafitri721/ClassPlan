import { TERM_LABEL } from '@classplan/shared';

const dateTime = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const dateOnly = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' });

export function formatDateTime(value) {
  if (!value) return '-';
  return dateTime.format(new Date(value));
}

export function formatDate(value) {
  if (!value) return '-';
  return dateOnly.format(new Date(value));
}

export function termLabel(term) {
  return TERM_LABEL[term] ?? term;
}

export function periodLabel(academicYear, term) {
  if (!academicYear) return '-';
  return `${academicYear} ${termLabel(term)}`;
}

export function lecturerNames(lecturers = []) {
  if (!lecturers.length) return 'Belum ada dosen';
  return lecturers.map((lecturer) => lecturer.name).join(', ');
}

export function plural(count, singular, pluralWord) {
  return `${count} ${count === 1 ? singular : pluralWord}`;
}
