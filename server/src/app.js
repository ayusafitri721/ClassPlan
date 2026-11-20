import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { requireAuth } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import courseRoutes from './modules/courses/courses.routes.js';
import lecturerRoutes from './modules/lecturers/lecturers.routes.js';
import classRoutes from './modules/classes/classes.routes.js';
import semesterRoutes from './modules/semesters/semesters.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import graphRoutes from './modules/graph/graph.routes.js';
import runRoutes from './modules/runs/runs.routes.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(express.json({ limit: '128kb' }));
  app.use(cookieParser());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);

  app.use('/api', requireAuth);
  app.use('/api/courses', courseRoutes);
  app.use('/api/lecturers', lecturerRoutes);
  app.use('/api/classes', classRoutes);
  app.use('/api/semesters', semesterRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/graph', graphRoutes);
  app.use('/api/scheduling-runs', runRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
