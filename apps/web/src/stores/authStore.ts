import { create } from "zustand";
import type { User } from "@haven/shared";
import * as authApi from "@/api/auth.api";
import * as usersApi from "@/api/users.api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("haven_token"),
  isAuthenticated: !!localStorage.getItem("haven_token"),
  isLoading: false,

  login: async (email, password) => {
    const result = await authApi.login(email, password);
    localStorage.setItem("haven_token", result.token);
    localStorage.setItem("haven_refresh_token", result.refreshToken);
    set({ user: result.user, token: result.token, isAuthenticated: true });
  },

  register: async (username, email, password) => {
    const result = await authApi.register(username, email, password);
    localStorage.setItem("haven_token", result.token);
    localStorage.setItem("haven_refresh_token", result.refreshToken);
    set({ user: result.user, token: result.token, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem("haven_token");
    localStorage.removeItem("haven_refresh_token");
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const user = await usersApi.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem("haven_token");
      localStorage.removeItem("haven_refresh_token");
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user }),
}));
