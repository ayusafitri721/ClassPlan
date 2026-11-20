import { Router } from 'express';
import { settingsSchema } from '@classplan/shared';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getSettings, updateSettings } from './settings.service.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ settings: await getSettings() });
  })
);

router.put(
  '/',
  validate(settingsSchema),
  asyncHandler(async (req, res) => {
    res.json({ settings: await updateSettings(req.body) });
  })
);

export default router;
