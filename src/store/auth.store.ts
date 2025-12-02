import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { type AuthTokens, type AuthUser } from "@/core/types/auth";

type AuthState = {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isInitializing: boolean;
  setAuth: (payload: {
    user: AuthUser | null;
    tokens: AuthTokens | null;
  }) => void;
  clearAuth: () => void;
  hasRole: (roleName: string) => boolean;
  setHydrated: () => void;
  isTokenExpired: () => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isInitializing: true,
      setAuth: ({ user, tokens }) => set({ user, tokens }),
      clearAuth: () => set({ user: null, tokens: null }),
      hasRole: (roleName: string) =>
        !!get().user?.roles?.some(
          (role) => role.name.toLowerCase() === roleName.toLowerCase()
        ),
      setHydrated: () => set({ isInitializing: false }),
      isTokenExpired: () => {
        const tokens = get().tokens;
        if (!tokens?.accessExpiresAt) return false; // ASP.NET or no expiry info
        return Date.now() >= tokens.accessExpiresAt;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
