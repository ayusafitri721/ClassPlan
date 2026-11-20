import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useClasses, useSemesters } from './queries.js';

export function useScope() {
  const [params, setParams] = useSearchParams();
  const classesQuery = useClasses();
  const semestersQuery = useSemesters();

  const classList = classesQuery.data?.classes ?? [];
  const semesterList = semestersQuery.data?.semesters ?? [];

  const requestedClass = Number(params.get('class')) || null;
  const requestedSemester = Number(params.get('semester')) || null;

  const classId = classList.some((item) => item.id === requestedClass)
    ? requestedClass
    : classList[0]?.id ?? null;

  const semesterId = semesterList.some((item) => item.id === requestedSemester)
    ? requestedSemester
    : semesterList[0]?.id ?? null;

  const activeClass = classList.find((item) => item.id === classId) ?? null;
  const activeSemester = semesterList.find((item) => item.id === semesterId) ?? null;

  const setScope = (next) => {
    const search = new URLSearchParams(params);
    if (next.classId) search.set('class', String(next.classId));
    if (next.semesterId) search.set('semester', String(next.semesterId));
    setParams(search, { replace: true });
  };

  useEffect(() => {
    if (classesQuery.isLoading || semestersQuery.isLoading) return;
    if (!classId || !semesterId) return;
    if (requestedClass === classId && requestedSemester === semesterId) return;

    const search = new URLSearchParams(params);
    search.set('class', String(classId));
    search.set('semester', String(semesterId));
    setParams(search, { replace: true });
  }, [
    classId,
    semesterId,
    requestedClass,
    requestedSemester,
    params,
    setParams,
    classesQuery.isLoading,
    semestersQuery.isLoading,
  ]);

  return {
    classId,
    semesterId,
    classList,
    semesterList,
    activeClass,
    activeSemester,
    setScope,
    isLoading: classesQuery.isLoading || semestersQuery.isLoading,
    error: classesQuery.error ?? semestersQuery.error ?? null,
    missing: !classList.length || !semesterList.length,
  };
}
