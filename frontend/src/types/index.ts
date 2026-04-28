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

export interface Page {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  addressLocation: unknown | null;
  mapCenter: unknown | null;
  mapZoom: number;
  mapMinZoom: number;
  mapMaxZoom: number;
  pricePerDay: number;
  iban: string | null;
  termsAndConditionsUrl: string | null;
  openingHoursJson: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
}

export interface ApiError {
  title: string;
  detail: string;
  status: number;
  errors?: Record<string, string[]>;
}
