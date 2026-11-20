import { api, toQuery } from './client.js';

export const login = (body) => api.post('/auth/login', body);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');

export const getCourses = ({ classId, semesterId, search } = {}) =>
  api.get(`/courses${toQuery({ classId, semesterId, search })}`);
export const createCourse = (body) => api.post('/courses', body);
export const updateCourse = (id, body) => api.put(`/courses/${id}`, body);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);

export const getLecturers = (params = {}) => api.get(`/lecturers${toQuery(params)}`);
export const createLecturer = (body) => api.post('/lecturers', body);
export const updateLecturer = (id, body) => api.put(`/lecturers/${id}`, body);
export const deleteLecturer = (id) => api.delete(`/lecturers/${id}`);

export const getClasses = () => api.get('/classes');
export const createClass = (body) => api.post('/classes', body);
export const updateClass = (id, body) => api.put(`/classes/${id}`, body);
export const deleteClass = (id) => api.delete(`/classes/${id}`);

export const getSemesters = () => api.get('/semesters');
export const createSemester = (body) => api.post('/semesters', body);
export const updateSemester = (id, body) => api.put(`/semesters/${id}`, body);
export const deleteSemester = (id) => api.delete(`/semesters/${id}`);

export const getSettings = () => api.get('/settings');
export const updateSettings = (body) => api.put('/settings', body);

export const getDashboard = ({ classId, semesterId } = {}) =>
  api.get(`/dashboard${toQuery({ classId, semesterId })}`);
export const getGraph = ({ classId, semesterId, conflictMode } = {}) =>
  api.get(`/graph${toQuery({ classId, semesterId, conflictMode })}`);

export const getRuns = ({ classId, semesterId } = {}) =>
  api.get(`/scheduling-runs${toQuery({ classId, semesterId })}`);
export const createRun = (body) => api.post('/scheduling-runs', body);
export const getRun = (id) => api.get(`/scheduling-runs/${id}`);
export const getReport = (id) => api.get(`/scheduling-runs/${id}/report`);
