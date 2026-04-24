import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const login = (email, password) => api.post('/auth/login', { email, password });

export const getItems = (feature, search = '') => api.get(`/${feature}${search ? `?search=${search}` : ''}`);
export const getItem = (feature, id) => api.get(`/${feature}/${id}`);
export const createItem = (feature, data) => api.post(`/${feature}`, data);
export const updateItem = (feature, id, data) => api.put(`/${feature}/${id}`, data);
export const deleteItem = (feature, id) => api.delete(`/${feature}/${id}`);
export const analyzeItem = (feature, id) => api.post(`/${feature}/${id}/analyze`);

export default api;
