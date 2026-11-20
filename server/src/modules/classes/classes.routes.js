import { Router } from 'express';
import { classInputSchema } from '@classplan/shared';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  createClass,
  deleteClass,
  listClasses,
  updateClass,
} from './classes.service.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const classes = await listClasses();
    res.json({ classes });
  })
);

router.post(
  '/',
  validate(classInputSchema),
  asyncHandler(async (req, res) => {
    const created = await createClass(req.body);
    res.status(201).json({ class: created });
  })
);

router.put(
  '/:id',
  validate(classInputSchema),
  asyncHandler(async (req, res) => {
    const updated = await updateClass(Number(req.params.id), req.body);
    res.json({ class: updated });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteClass(Number(req.params.id));
    res.status(204).end();
  })
);

export default router;
