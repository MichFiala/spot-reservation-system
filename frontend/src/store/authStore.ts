import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse } from '../types';

interface AuthState {
  token: string | null;
  expiresAtUtc: string | null;
  user: Pick<AuthResponse, 'userId' | 'email' | 'role'> | null;
  setAuth: (response: AuthResponse) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

function isTokenExpired(expiresAtUtc: string | null): boolean {
  if (!expiresAtUtc) return true;
  return new Date(expiresAtUtc).getTime() <= Date.now();
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      expiresAtUtc: null,
      user: null,

      setAuth: (response) => {
        localStorage.setItem('token', response.token);
        set({
          token: response.token,
          expiresAtUtc: response.expiresAtUtc,
          user: {
            userId: response.userId,
            email: response.email,
            role: response.role,
          },
        });
      },

      clearAuth: () => {
        localStorage.removeItem('token');
        set({ token: null, expiresAtUtc: null, user: null });
      },

      isAuthenticated: () => {
        const { token, expiresAtUtc } = get();
        if (!token) return false;
        if (isTokenExpired(expiresAtUtc)) {
          get().clearAuth();
          return false;
        }
        return true;
      },

      isAdmin: () => get().user?.role === 'Admin',
    }),
    {
      name: 'auth',
      partialize: (state) => ({
        token: state.token,
        expiresAtUtc: state.expiresAtUtc,
        user: state.user,
      }),
    },
  ),
);
