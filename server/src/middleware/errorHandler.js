import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';

const CONSTRAINT_MESSAGES = {
  courses_code_class_id_semester_id_key:
    'Kode mata kuliah sudah dipakai pada kelas dan semester ini',
  classes_name_study_program_key: 'Kelas dengan nama dan program studi itu sudah ada',
  semesters_academic_year_term_key: 'Semester dengan tahun dan term itu sudah ada',
  course_lecturers_course_id_lecturer_id_key: 'Dosen sudah terhubung ke mata kuliah ini',
  users_email_uidx: 'Email sudah terdaftar',
  lecturers_code_uidx: 'NIDN/NIP sudah dipakai dosen lain',
};

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Endpoint tidak ditemukan' },
  });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof AppError) {
    res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { fields: error.details } : {}),
      },
    });
    return;
  }

  if (error instanceof ZodError) {
    const fields = {};
    for (const issue of error.issues) {
      const key = issue.path.join('.') || '_';
      fields[key] ??= issue.message;
    }
    res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Data tidak valid', fields },
    });
    return;
  }

  if (error?.code === '23505') {
    res.status(409).json({
      error: {
        code: 'DUPLICATE',
        message: CONSTRAINT_MESSAGES[error.constraint] ?? 'Data sudah ada',
      },
    });
    return;
  }

  if (error?.code === '23503') {
    res.status(409).json({
      error: {
        code: 'IN_USE',
        message: 'Data masih dipakai oleh data lain dan belum bisa dihapus',
      },
    });
    return;
  }

  if (error?.code === '22P02') {
    res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Format data tidak valid' },
    });
    return;
  }

  console.error('[api]', error);
  res.status(500).json({
    error: {
      code: 'INTERNAL',
      message: 'Terjadi kesalahan pada server. Coba lagi sebentar lagi.',
    },
  });
}
