import { endpoints } from "@/core/api/endpoints";
import { apiFetch } from "@/core/api/client";
import { useApiMutation } from "@/core/api/hooks";
import { type AuthTokens, type AuthUser, type MeResponse } from "@/core/types/auth";
import { useAuthStore } from "@/store/auth.store";
import { type LoginFormValues } from "@/features/auth/types";

export const useLogin = () => {
  return useApiMutation<AuthUser, LoginFormValues>({
    mutationFn: async (values) => {
      const store = useAuthStore.getState();

      const tokens = await apiFetch<AuthTokens>(endpoints.auth.login, {
        body: { ...values, type: "web" as const },
        overrideBackendKind: "laravel",
      });

      // Store tokens FIRST so they're available for the /me request
      store.setAuth({ tokens });

      const me = await apiFetch<MeResponse>(endpoints.auth.me, {
        overrideBackendKind: "laravel",
      });

      const user: AuthUser = {
        id: me.user.id,
        name: me.user.name ?? null,
        email: me.user.email ?? null,
        phoneNo: me.user.phone_no ?? null,
        image: null,
        role: null,
      };

      const pos = me.pos
        ? {
            id: me.pos.id,
            name: me.pos.pos_name,
            lat: me.pos.pos_lat,
            lng: me.pos.pos_lng,
          }
        : null;

      const permissions = Array.isArray(me.perm) ? me.perm : [];
      const fees = typeof me.fees === "number" ? me.fees : null;

      store.setAuth({
        user,
        tokens,
        pos,
        permissions,
        fees,
      });

      return user;
    },
    successMessageKey: "common.toasts.success",
  });
};
