import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as endpoints from '../api/endpoints.js';

export const useMe = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: endpoints.getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

export const useClasses = () =>
  useQuery({ queryKey: ['classes'], queryFn: endpoints.getClasses });

export const useSemesters = () =>
  useQuery({ queryKey: ['semesters'], queryFn: endpoints.getSemesters });

export const useSettings = () =>
  useQuery({ queryKey: ['settings'], queryFn: endpoints.getSettings });

export const useLecturers = (search = '') =>
  useQuery({
    queryKey: ['lecturers', search],
    queryFn: () => endpoints.getLecturers({ search }),
  });

export const useCourses = (scope) =>
  useQuery({
    queryKey: ['courses', scope.classId, scope.semesterId],
    queryFn: () => endpoints.getCourses(scope),
    enabled: Boolean(scope.classId && scope.semesterId),
  });

export const useDashboard = (scope) =>
  useQuery({
    queryKey: ['dashboard', scope.classId, scope.semesterId],
    queryFn: () => endpoints.getDashboard(scope),
    enabled: Boolean(scope.classId && scope.semesterId),
  });

export const useGraph = (scope) =>
  useQuery({
    queryKey: ['graph', scope.classId, scope.semesterId, scope.conflictMode],
    queryFn: () => endpoints.getGraph(scope),
    enabled: Boolean(scope.classId && scope.semesterId),
  });

export const useRuns = (scope = {}) =>
  useQuery({
    queryKey: ['runs', scope.classId, scope.semesterId],
    queryFn: () => endpoints.getRuns(scope),
  });

export const useRun = (id) =>
  useQuery({
    queryKey: ['run', id],
    queryFn: () => endpoints.getRun(id),
    enabled: Boolean(id),
  });

export const useReport = (id) =>
  useQuery({
    queryKey: ['report', id],
    queryFn: () => endpoints.getReport(id),
    enabled: Boolean(id),
  });

function useInvalidate(keys) {
  const queryClient = useQueryClient();
  return () => keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
}

export function useCourseMutations() {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all(
      ['courses', 'dashboard', 'graph', 'lecturers', 'runs'].map((key) =>
        queryClient.invalidateQueries({ queryKey: [key] })
      )
    );

  const save = useMutation({
    mutationFn: ({ id, body }) => (id ? endpoints.updateCourse(id, body) : endpoints.createCourse(body)),
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: (id) => endpoints.deleteCourse(id),
    onSuccess: refresh,
  });

  return { save, remove };
}

export function useLecturerMutations() {
  const invalidate = useInvalidate(['lecturers', 'courses', 'dashboard', 'graph']);
  const save = useMutation({
    mutationFn: ({ id, body }) =>
      id ? endpoints.updateLecturer(id, body) : endpoints.createLecturer(body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id) => endpoints.deleteLecturer(id),
    onSuccess: invalidate,
  });
  return { save, remove };
}

export function useClassMutations() {
  const invalidate = useInvalidate(['classes', 'dashboard', 'courses']);
  const save = useMutation({
    mutationFn: ({ id, body }) => (id ? endpoints.updateClass(id, body) : endpoints.createClass(body)),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id) => endpoints.deleteClass(id),
    onSuccess: invalidate,
  });
  return { save, remove };
}

export function useSemesterMutations() {
  const invalidate = useInvalidate(['semesters', 'dashboard', 'courses']);
  const save = useMutation({
    mutationFn: ({ id, body }) =>
      id ? endpoints.updateSemester(id, body) : endpoints.createSemester(body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id) => endpoints.deleteSemester(id),
    onSuccess: invalidate,
  });
  return { save, remove };
}

export function useSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: endpoints.updateSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useAnalyze() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: endpoints.createRun,
    onSuccess: () => {
      ['runs', 'dashboard', 'report'].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] })
      );
    },
  });
}
