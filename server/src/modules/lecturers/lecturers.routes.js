import { Router } from 'express';
import { lecturerInputSchema, scopeQuerySchema } from '@classplan/shared';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  createLecturer,
  deleteLecturer,
  getLecturerById,
  listLecturers,
  updateLecturer,
} from './lecturers.service.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  validate(scopeQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const lecturers = await listLecturers({ search: res.locals.query.search });
    res.json({ lecturers });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const lecturer = await getLecturerById(Number(req.params.id));
    res.json({ lecturer });
  })
);

router.post(
  '/',
  validate(lecturerInputSchema),
  asyncHandler(async (req, res) => {
    const lecturer = await createLecturer(req.body);
    res.status(201).json({ lecturer });
  })
);

router.put(
  '/:id',
  validate(lecturerInputSchema),
  asyncHandler(async (req, res) => {
    const lecturer = await updateLecturer(Number(req.params.id), req.body);
    res.json({ lecturer });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteLecturer(Number(req.params.id));
    res.status(204).end();
  })
);

export default router;
