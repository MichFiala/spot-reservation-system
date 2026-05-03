import axios from 'axios';
import { getTenantFromSubdomain } from '../utils/tenant';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || window.location.origin,
});

apiClient.interceptors.request.use((config) => {
  const tenantId = getTenantFromSubdomain();
  if (tenantId) {
    config.headers['X-Tenant-Id'] = tenantId;
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
