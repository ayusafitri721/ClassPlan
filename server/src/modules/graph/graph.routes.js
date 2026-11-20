import { Router } from 'express';
import { graphQuerySchema } from '@classplan/shared';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getGraphPreview } from './graph.service.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  validate(graphQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    res.json({ graph: await getGraphPreview(res.locals.query) });
  })
);

export default router;
