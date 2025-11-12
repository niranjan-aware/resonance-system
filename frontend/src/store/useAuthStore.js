import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../services/api";
import toast from "react-hot-toast";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      showAuthModal: false,

      setShowAuthModal: (show) => set({ showAuthModal: show }),

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/auth/login", credentials);
          const { token, user } = response.data;

          // ✅ Store token in localStorage
          localStorage.setItem("token", token);

          // ✅ Set axios default header
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

          console.log("✅ Login successful, token stored");
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || "Login failed",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        toast.success("Logged out successfully");
      },

      checkAuth: async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const response = await api.get("/auth/me");
          set({
            user: response.data.user,
            isAuthenticated: true,
          });
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
