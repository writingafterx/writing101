import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

export const usersAPI = {
  getAll: (role) => api.get('/users', { params: { role } }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  enroll: (id, studentId) => api.post(`/courses/${id}/enroll`, { studentId }),
  drop: (id, studentId) => api.post(`/courses/${id}/drop`, { studentId }),
};

export const assignmentsAPI = {
  getByCourse: (courseId) => api.get(`/assignments/course/${courseId}`),
  getById: (id) => api.get(`/assignments/${id}`),
  create: (data) => api.post('/assignments', data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
  submit: (id, data) => api.post(`/assignments/${id}/submit`, data),
  grade: (submissionId, data) => api.post(`/assignments/submissions/${submissionId}/grade`, data),
};

export const discussionsAPI = {
  getByCourse: (courseId) => api.get(`/discussions/course/${courseId}`),
  getById: (id) => api.get(`/discussions/${id}`),
  create: (data) => api.post('/discussions', data),
  update: (id, data) => api.put(`/discussions/${id}`, data),
  delete: (id) => api.delete(`/discussions/${id}`),
  addReply: (id, data) => api.post(`/discussions/${id}/replies`, data),
  pin: (id) => api.post(`/discussions/${id}/pin`),
  lock: (id) => api.post(`/discussions/${id}/lock`),
};

export default api;
