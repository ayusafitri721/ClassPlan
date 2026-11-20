import { Router } from 'express';
import { semesterInputSchema } from '@classplan/shared';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  createSemester,
  deleteSemester,
  listSemesters,
  updateSemester,
} from './semesters.service.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const semesters = await listSemesters();
    res.json({ semesters });
  })
);

router.post(
  '/',
  validate(semesterInputSchema),
  asyncHandler(async (req, res) => {
    const created = await createSemester(req.body);
    res.status(201).json({ semester: created });
  })
);

router.put(
  '/:id',
  validate(semesterInputSchema),
  asyncHandler(async (req, res) => {
    const updated = await updateSemester(Number(req.params.id), req.body);
    res.json({ semester: updated });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteSemester(Number(req.params.id));
    res.status(204).end();
  })
);

export default router;
