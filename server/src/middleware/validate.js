import { AppError } from '../utils/errors.js';

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const parsed = schema.safeParse(req[source]);

    if (!parsed.success) {
      const fields = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.') || '_';
        fields[key] ??= issue.message;
      }
      next(new AppError(400, 'VALIDATION_ERROR', 'Data tidak valid', fields));
      return;
    }

    if (source === 'query') {
      res.locals.query = parsed.data;
    } else {
      req[source] = parsed.data;
    }
    next();
  };
}
