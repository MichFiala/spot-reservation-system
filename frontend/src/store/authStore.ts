import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse } from '../types';

interface AuthState {
  token: string | null;
  user: Pick<AuthResponse, 'userId' | 'email' | 'role'> | null;
  setAuth: (response: AuthResponse) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      setAuth: (response) => {
        localStorage.setItem('token', response.token);
        set({
          token: response.token,
          user: {
            userId: response.userId,
            email: response.email,
            role: response.role,
          },
        });
      },

      clearAuth: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null });
      },

      isAuthenticated: () => get().token !== null,
      isAdmin: () => get().user?.role === 'Admin',
    }),
    {
      name: 'auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
