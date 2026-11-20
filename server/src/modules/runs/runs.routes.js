import { Router } from 'express';
import { runInputSchema, runQuerySchema } from '@classplan/shared';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { createRun, getRunById, getRunCsv, getRunReport, listRuns } from './runs.service.js';

const router = Router();

router.use(requireAuth);

router.post(
  '/',
  validate(runInputSchema),
  asyncHandler(async (req, res) => {
    const run = await createRun({ ...req.body, userId: req.user.id });
    res.status(201).json({ run });
  })
);

router.get(
  '/',
  validate(runQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    res.json({ runs: await listRuns(res.locals.query) });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json({ run: await getRunById(Number(req.params.id)) });
  })
);

router.get(
  '/:id/report',
  asyncHandler(async (req, res) => {
    res.json({ report: await getRunReport(Number(req.params.id)) });
  })
);

router.get(
  '/:id/export.csv',
  asyncHandler(async (req, res) => {
    const csv = await getRunCsv(Number(req.params.id));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="classplan-run-${req.params.id}.csv"`
    );
    res.send(csv);
  })
);

export default router;
