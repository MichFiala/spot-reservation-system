export interface AuthResponse {
  userId: string;
  email: string;
  role: string;
  token: string;
  expiresAtUtc: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface Spot {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAtUtc: string;
  location: string | null;
}

export interface Reservation {
  id: string;
  spotId: string;
  userId: string;
  startUtc: string;
  endUtc: string;
  status: string;
  createdAtUtc: string;
  approvedAtUtc: string | null;
  cancelledAtUtc: string | null;
}

export interface CreateReservationRequest {
  spotId: string;
  startUtc: string;
  endUtc: string;
}

export interface ApiError {
  title: string;
  detail: string;
  status: number;
  errors?: Record<string, string[]>;
}
