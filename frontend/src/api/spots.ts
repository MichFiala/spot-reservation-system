import { apiClient } from './client';
import type { Spot } from '../types';

export const spotsApi = {
  list: (onlyActive = true) =>
    apiClient.get<Spot[]>('/api/spots', { params: { onlyActive } }).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Spot>(`/api/spots/${id}`).then((r) => r.data),
};
