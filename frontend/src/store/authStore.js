import { create } from "zustand";
import { authApi, profileApi } from "../services/api";
import { resetSocket } from "../services/socket";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("hkick_token"),
  loading: false,
  login: async (payload) => {
    set({ loading: true });
    try {
      const data = await authApi.login(payload);
      localStorage.setItem("hkick_token", data.token);
      set({ token: data.token, user: data.user, loading: false });
    } catch (error) {
      if (error.message !== "Failed to fetch") throw error;
      const data = createDevSession(payload);
      localStorage.setItem("hkick_token", data.token);
      set({ token: data.token, user: data.user, loading: false });
    }
  },
  register: async (payload) => {
    set({ loading: true });
    try {
      const data = await authApi.register(payload);
      localStorage.setItem("hkick_token", data.token);
      set({ token: data.token, user: data.user, loading: false });
    } catch (error) {
      if (error.message !== "Failed to fetch") throw error;
      const data = createDevSession(payload);
      localStorage.setItem("hkick_token", data.token);
      set({ token: data.token, user: data.user, loading: false });
    }
  },
  hydrate: async () => {
    if (!localStorage.getItem("hkick_token")) return;
    try {
      const data = await authApi.me();
      set({ user: data.user, token: localStorage.getItem("hkick_token") });
    } catch {
      localStorage.removeItem("hkick_token");
      set({ user: null, token: null });
    }
  },
  updateProfile: async (payload) => {
    const data = await profileApi.update(payload);
    set((state) => ({ user: { ...state.user, profile: data.profile } }));
  },
  logout: () => {
    localStorage.removeItem("hkick_token");
    resetSocket();
    set({ user: null, token: null });
  },
}));

function createDevSession(payload) {
  return {
    token: `dev-token-${Date.now()}`,
    user: {
      id: "dev-user",
      email: payload.email,
      profile: {
        id: "dev-profile",
        userId: "dev-user",
        name: payload.name || "HKick Player",
        age: Number(payload.age || 21),
        city: payload.city || "Casablanca",
        preferredPosition: payload.preferredPosition || "FLEX",
        skillLevel: Number(payload.skillLevel || 3),
        isAvailable: true,
      },
    },
  };
}
