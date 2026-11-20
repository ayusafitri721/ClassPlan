export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message, details) =>
  new AppError(400, 'VALIDATION_ERROR', message, details);

export const unauthorized = (message = 'Sesi tidak valid atau sudah berakhir') =>
  new AppError(401, 'UNAUTHORIZED', message);

export const forbidden = (message = 'Kamu tidak punya akses ke tindakan ini') =>
  new AppError(403, 'FORBIDDEN', message);

export const notFound = (message = 'Data tidak ditemukan') =>
  new AppError(404, 'NOT_FOUND', message);

export const conflict = (message, details) =>
  new AppError(409, 'CONFLICT', message, details);

export const unprocessable = (code, message, details) =>
  new AppError(422, code, message, details);
