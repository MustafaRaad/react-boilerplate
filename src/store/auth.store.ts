import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { type AuthPos, type AuthTokens, type AuthUser } from "@/core/types/auth";

type AuthState = {
  user: AuthUser | null;
  pos: AuthPos | null;
  permissions: string[];
  fees: number | null;
  tokens: AuthTokens | null;
  isInitializing: boolean;
  setAuth: (payload: {
    user?: AuthUser | null;
    tokens?: AuthTokens | null;
    pos?: AuthPos | null;
    permissions?: string[] | null;
    fees?: number | null;
  }) => void;
  clearAuth: () => void;
  hasPermission: (permission: string) => boolean;
  setHydrated: () => void;
  isTokenExpired: () => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      pos: null,
      permissions: [],
      fees: null,
      tokens: null,
      isInitializing: true,
      setAuth: ({ user, tokens, pos, permissions, fees }) =>
        set((state) => ({
          user: user !== undefined ? user : state.user,
          tokens: tokens !== undefined ? tokens : state.tokens,
          pos: pos !== undefined ? pos : state.pos,
          permissions:
            permissions !== undefined
              ? permissions ?? []
              : state.permissions,
          fees: fees !== undefined ? fees : state.fees,
        })),
      clearAuth: () =>
        set({
          user: null,
          pos: null,
          permissions: [],
          fees: null,
          tokens: null,
        }),
      hasPermission: (permission: string) =>
        get().permissions?.includes(permission),
      setHydrated: () => set({ isInitializing: false }),
      isTokenExpired: () => {
        const tokens = get().tokens;
        if (!tokens?.accessTokenExpiresAt) return false;
        return Date.now() >= tokens.accessTokenExpiresAt;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        pos: state.pos,
        permissions: state.permissions,
        fees: state.fees,
        tokens: state.tokens,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
