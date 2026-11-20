import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './components/layout/RequireAuth.jsx';
import { AppShell } from './components/layout/AppShell.jsx';
import { PageLoading } from './components/ui/Feedback.jsx';

const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const CoursesPage = lazy(() => import('./pages/CoursesPage.jsx'));
const LecturersPage = lazy(() => import('./pages/LecturersPage.jsx'));
const GraphPage = lazy(() => import('./pages/GraphPage.jsx'));
const AnalysisPage = lazy(() => import('./pages/AnalysisPage.jsx'));
const ResultsPage = lazy(() => import('./pages/ResultsPage.jsx'));
const ReportPage = lazy(() => import('./pages/ReportPage.jsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

export default function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="lecturers" element={<LecturersPage />} />
          <Route path="graph" element={<GraphPage />} />
          <Route path="analysis" element={<AnalysisPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="results/:id" element={<ResultsPage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="report/:id" element={<ReportPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="dashboard" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
