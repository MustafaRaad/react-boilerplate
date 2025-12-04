import { apiFetch } from "@/core/api/client";
import { endpoints } from "@/core/api/endpoints";
import { useApiMutation } from "@/core/api/hooks";
import { backendKind } from "@/core/config/env";
import {
  laravelMeSchema,
  aspNetMeSchema,
} from "@/features/auth/schemas/auth.schema";
import {
  type AspNetPhoneLoginRequest,
  type AspNetUsernameLoginRequest,
  type AuthMeResponse,
  type AuthTokens,
  type AuthUser,
  type AuthPos,
  type LaravelLoginRequest,
} from "@/core/types/auth";
import { useAuthStore } from "@/store/auth.store";
import { type LoginFormValues } from "@/features/auth/types";

export const useLogin = () => {
  return useApiMutation<AuthUser, LoginFormValues>({
    mutationFn: async (values) => {
      const store = useAuthStore.getState();
      const targetBackend = backendKind;

      const buildAspNetPayload = (
        input: LoginFormValues
      ): AspNetPhoneLoginRequest | AspNetUsernameLoginRequest => {
        const trimmed = input.email.trim();
        const isLikelyPhone = /^\+?\d{7,}$/.test(trimmed);
        const base = {
          password: input.password,
          clientId: "web",
          fingerprintHash: "web",
        } as const;

        return isLikelyPhone
          ? {
              ...base,
              phoneNumber: trimmed,
            }
          : {
              ...base,
              username: trimmed,
            };
      };

      const loginPayload: LaravelLoginRequest | AspNetPhoneLoginRequest | AspNetUsernameLoginRequest =
        targetBackend === "laravel"
          ? {
              email: values.email,
              password: values.password,
              type: "web",
            }
          : buildAspNetPayload(values);

      const tokens = await apiFetch<AuthTokens>(endpoints.auth.login, {
        body: loginPayload,
        overrideBackendKind: targetBackend,
      });

      // Store tokens FIRST so they're available for the /me request
      store.setAuth({ tokens });

      const me = await apiFetch<AuthMeResponse>(endpoints.auth.me, {
        overrideBackendKind: targetBackend,
      });

      let user: AuthUser | null = null;
      let permissions: string[] = [];
      let fees: number | null = null;
      let pos: AuthPos | null = null;

      if (targetBackend === "laravel") {
        const parsed = laravelMeSchema.safeParse(me);
        if (!parsed.success) {
          throw new Error("Invalid /me response for Laravel backend");
        }

        user = {
          id: parsed.data.user.id,
          name: parsed.data.user.name ?? null,
          email: parsed.data.user.email ?? null,
          phoneNo: parsed.data.user.phone_no ?? null,
          image: null,
          role: null,
          backend: "laravel",
        };

        pos = parsed.data.pos
          ? {
              id: parsed.data.pos.id,
              name: parsed.data.pos.pos_name,
              lat: parsed.data.pos.pos_lat,
              lng: parsed.data.pos.pos_lng,
            }
          : null;

        permissions = Array.isArray(parsed.data.perm) ? parsed.data.perm : [];
        fees = typeof parsed.data.fees === "number" ? parsed.data.fees : null;
      } else {
        // ASP.NET me can arrive raw or inside an envelope
        const candidate =
          (me as { result?: unknown })?.result ?? (me as unknown);
        const parsed = aspNetMeSchema.safeParse(candidate);
        if (!parsed.success) {
          throw new Error("Invalid /me response for ASP.NET backend");
        }

        const fullName =
          parsed.data.fullName ||
          parsed.data.username ||
          [parsed.data.firstName, parsed.data.lastName]
            .filter(Boolean)
            .join(" ");

        user = {
          id: parsed.data.id,
          name: fullName || null,
          email: parsed.data.username ?? null,
          phoneNo: parsed.data.phoneNumber ?? null,
          image: parsed.data.photo ?? null,
          role: parsed.data.role?.name ?? null,
          roles: parsed.data.role
            ? [{ id: parsed.data.role.id, name: parsed.data.role.name }]
            : undefined,
          backend: "aspnet",
        };

        pos = null;
        permissions = [];
        fees = null;
      }

      if (!user) {
        throw new Error("Failed to normalize user profile");
      }

      store.setAuth({
        user,
        tokens,
        pos,
        permissions,
        fees,
      });

      return user;
    },
    successMessageKey: "common:toasts.loginSuccess",
  });
};
