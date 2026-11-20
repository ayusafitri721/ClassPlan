import { Router } from 'express';
import { courseInputSchema, lecturerIdsSchema, scopeQuerySchema } from '@classplan/shared';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  createCourse,
  deleteCourse,
  getCourseById,
  listCourses,
  setCourseLecturers,
  updateCourse,
} from './courses.service.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  validate(scopeQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const courses = await listCourses(res.locals.query);
    res.json({ courses });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const course = await getCourseById(Number(req.params.id));
    res.json({ course });
  })
);

router.post(
  '/',
  validate(courseInputSchema),
  asyncHandler(async (req, res) => {
    const course = await createCourse(req.body);
    res.status(201).json({ course });
  })
);

router.put(
  '/:id',
  validate(courseInputSchema),
  asyncHandler(async (req, res) => {
    const course = await updateCourse(Number(req.params.id), req.body);
    res.json({ course });
  })
);

router.put(
  '/:id/lecturers',
  validate(lecturerIdsSchema),
  asyncHandler(async (req, res) => {
    const course = await setCourseLecturers(Number(req.params.id), req.body.lecturerIds);
    res.json({ course });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteCourse(Number(req.params.id));
    res.status(204).end();
  })
);

export default router;
