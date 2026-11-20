import { Router } from 'express';
import { runQuerySchema } from '@classplan/shared';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getDashboard } from './dashboard.service.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  validate(runQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    res.json({ dashboard: await getDashboard(res.locals.query) });
  })
);

export default router;
