import { z } from 'zod';
import {
  ACTIVE_CONFLICT_MODES,
  CONFLICT_MODE,
  DAY,
  TIE_BREAK,
  TIE_BREAK_LABEL,
  TERM,
} from './constants.js';

const id = z.coerce.number().int().positive('ID tidak valid');

const idList = z.preprocess(
  (value) =>
    typeof value === 'string' && value.trim()
      ? value.split(',').map((item) => item.trim()).filter(Boolean)
      : value,
  z.array(id).optional()
);

const blankToNull = (value) => (value === '' || value === undefined ? null : value);

const clock = z.preprocess(
  blankToNull,
  z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format jam: 13:50')
    .nullable()
    .transform((value) => value || null)
);

const academicYear = z
  .string()
  .trim()
  .regex(/^\d{4}\/\d{4}$/, 'Format tahun akademik: 2026/2027');

const tieBreakRule = z
  .array(z.enum(Object.values(TIE_BREAK)))
  .min(1, 'Aturan pemecah seri wajib dipilih')
  .refine((rule) => rule[0] === TIE_BREAK.DEGREE_DESC, {
    message: 'Aturan pertama harus derajat menurun',
  })
  .refine((rule) => new Set(rule).size === rule.length, {
    message: 'Aturan pemecah seri tidak boleh berulang',
  });

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Kata sandi wajib diisi').max(200),
});

export const courseInputSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Kode wajib diisi')
    .max(12, 'Kode maksimal 12 karakter')
    .regex(/^[A-Za-z0-9-]+$/, 'Kode hanya boleh huruf, angka, dan tanda hubung')
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(1, 'Nama wajib diisi').max(120, 'Nama maksimal 120 karakter'),
  credits: z.coerce
    .number()
    .int('SKS harus bilangan bulat')
    .min(1, 'SKS minimal 1')
    .max(12, 'SKS maksimal 12'),
  classId: id,
  semesterId: id,
  lecturerIds: z.array(id).default([]).refine((ids) => new Set(ids).size === ids.length, {
    message: 'Dosen tidak boleh dipilih dua kali',
  }),
  dayOfWeek: z.preprocess(
    blankToNull,
    z.enum(Object.values(DAY)).nullable().transform((value) => value ?? null)
  ),
  startTime: clock,
  endTime: clock,
});

export const lecturerInputSchema = z.object({
  name: z.string().trim().min(1, 'Nama wajib diisi').max(120, 'Nama maksimal 120 karakter'),
  lecturerCode: z
    .string()
    .trim()
    .max(32, 'NIDN/NIP maksimal 32 karakter')
    .optional()
    .transform((value) => (value ? value : null)),
});

export const classInputSchema = z.object({
  name: z.string().trim().min(1, 'Nama kelas wajib diisi').max(60),
  studyProgram: z.string().trim().min(1, 'Program studi wajib diisi').max(120),
  cohortYear: z.coerce
    .number()
    .int('Angkatan harus bilangan bulat')
    .min(1900, 'Angkatan tidak valid')
    .max(2100, 'Angkatan tidak valid'),
});

export const semesterInputSchema = z.object({
  academicYear,
  term: z.enum(Object.values(TERM)),
});

export const settingsSchema = z.object({
  institutionName: z.string().trim().max(160).default(''),
  studyProgram: z.string().trim().max(160).default(''),
  academicYear: academicYear.or(z.literal('')).default(''),
  term: z.enum(Object.values(TERM)).default(TERM.GANJIL),
  defaultConflictMode: z.enum(ACTIVE_CONFLICT_MODES).default('lecturer'),
  tieBreakRule,
});

export const runInputSchema = z.object({
  classId: id,
  classIds: idList,
  semesterId: id,
  conflictMode: z.enum(ACTIVE_CONFLICT_MODES, {
    errorMap: () => ({ message: 'Mode konflik belum tersedia' }),
  }),
  tieBreakRule,
});

export const scopeQuerySchema = z.object({
  classId: z.coerce.number().int().positive().optional(),
  classIds: idList,
  semesterId: z.coerce.number().int().positive().optional(),
  search: z.string().trim().max(80).optional().default(''),
});

export const runQuerySchema = z.object({
  classId: z.coerce.number().int().positive().optional(),
  classIds: idList,
  semesterId: z.coerce.number().int().positive().optional(),
});

export const graphQuerySchema = z.object({
  classId: z.coerce.number().int().positive(),
  classIds: idList,
  semesterId: z.coerce.number().int().positive(),
  conflictMode: z.enum(ACTIVE_CONFLICT_MODES).default(CONFLICT_MODE.LECTURER),
});

export const lecturerIdsSchema = z.object({
  lecturerIds: z
    .array(id)
    .default([])
    .refine((ids) => new Set(ids).size === ids.length, {
      message: 'Dosen tidak boleh dipilih dua kali',
    }),
});

export const describeTieBreak = (rule = []) =>
  rule.map((key) => TIE_BREAK_LABEL[key] ?? key).join(', lalu ');
