import axios from 'axios';
import { getTenantFromSubdomain } from '../utils/tenant';
import { useAuthStore } from '../store/authStore';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || window.location.origin,
});

apiClient.interceptors.request.use((config) => {
  const tenantId = getTenantFromSubdomain();
  if (tenantId) {
    config.headers['X-Tenant-Id'] = tenantId;
  }

  const { token, expiresAtUtc, clearAuth } = useAuthStore.getState();
  if (token) {
    if (expiresAtUtc && new Date(expiresAtUtc).getTime() <= Date.now()) {
      clearAuth();
      window.location.href = '/přihlášení';
      return Promise.reject(new axios.Cancel('Token expired'));
    }
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/přihlášení';
    }
    return Promise.reject(error);
  },
);
