// src/utils/api.js
import axios from 'axios';

// Base URL from Vite environment variable
const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

apiInstance.interceptors.request.use((config) => {
  const companyId = localStorage.getItem('company_id');
  if (companyId) {
    config.headers['X-Company-ID'] = companyId;
  }
  return config;
});

// Helper functions for each HTTP method
export const api = {
  get: (url, config = {}) => apiInstance.get(url, config).then(res => res.data),
  post: (url, data, config = {}) => apiInstance.post(url, data, config).then(res => res.data),
  put: (url, data, config = {}) => apiInstance.put(url, data, config).then(res => res.data),
  patch: (url, data, config = {}) => apiInstance.patch(url, data, config).then(res => res.data),
  delete: (url, config = {}) => apiInstance.delete(url, config).then(res => res.data),
  options: (url, config = {}) => apiInstance.options(url, config).then(res => res.data)
};
