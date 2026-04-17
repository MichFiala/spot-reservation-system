import { apiClient } from './client';
import type { CreateReservationRequest, Reservation } from '../types';

export const reservationsApi = {
  create: (data: CreateReservationRequest) =>
    apiClient.post<Reservation>('/api/reservations', data).then((r) => r.data),

  listMine: () =>
    apiClient.get<Reservation[]>('/api/reservations/my').then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Reservation>(`/api/reservations/${id}`).then((r) => r.data),

  cancel: (id: string) =>
    apiClient.delete(`/api/reservations/${id}`),
};
