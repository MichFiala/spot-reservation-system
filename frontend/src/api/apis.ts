import { AuthApi, ReservationsApi, ReservationPagesApi, SpotsApi, SpotPhotosApi } from '../api-client';
import { apiClient } from './client';

export const authApi = new AuthApi(undefined, undefined, apiClient);
export const reservationsApi = new ReservationsApi(undefined, undefined, apiClient);
export const reservationPagesApi = new ReservationPagesApi(undefined, undefined, apiClient);
export const spotsApi = new SpotsApi(undefined, undefined, apiClient);
export const spotsPhotosApi = new SpotPhotosApi(undefined, undefined, apiClient);
