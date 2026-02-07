/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { apiFetch } from "@/core/api/client";
import { endpoints } from "@/core/api/endpoints";
import { useApiMutation } from "@/core/api/hooks";
import { backendKind } from "@/core/config/env";
import { DEFAULT_RATE_LIMITS, rateLimiter } from "@/core/security/rateLimit";
import {
  normalizeUserProfile,
  buildLoginRequestBody,
} from "@/core/api/normalizers";
import {
  type AuthMeResponse,
  type AuthUser,
  type AuthTokens,
} from "@/features/auth/types/auth.types";
import { useAuthStore } from "@/store/auth.store";
import { type LoginFormValues } from "@/features/auth/types";
import { type UnifiedApiError } from "@/core/types/api";

export const useLogin = () => {
  return useApiMutation<AuthUser, LoginFormValues>({
    mutationFn: async (values) => {
      const rateLimitConfig = DEFAULT_RATE_LIMITS.login;
      const rateLimitKey = `login:${values.email.trim().toLowerCase()}`;

      if (!rateLimiter.check(rateLimitKey, rateLimitConfig)) {
        const retryAfter = rateLimiter.getRetryAfter(rateLimitKey);
        const error: UnifiedApiError = {
          code: 429,
          message:
            rateLimitConfig.message ||
            `Rate limit exceeded. Retry after ${Math.ceil(
              retryAfter / 1000
            )} seconds.`,
          raw: { retryAfter },
        };
        throw error;
      }

      const store = useAuthStore.getState();
      const targetBackend = backendKind;

      // Step 1: Build login request using centralized normalizer
      const loginPayload = buildLoginRequestBody(
        {
          email: values.email,
          password: values.password,
        },
        targetBackend
      );

      // Step 2: Call login endpoint
      // NOTE: apiFetch already normalizes the response to AuthTokens
      const tokens = await apiFetch<AuthTokens>(endpoints.auth.login, {
        body: loginPayload,
        overrideBackendKind: targetBackend,
      });

      // Step 3: Store tokens FIRST so they're available for the /me request
      store.setAuth({ tokens });

      // Step 4: Fetch user profile
      const meResponse = await apiFetch<AuthMeResponse>(endpoints.auth.me, {
        overrideBackendKind: targetBackend,
      });

      // Step 5: Normalize user profile using centralized normalizer
      const { user, permissions, pos, fees } = normalizeUserProfile(
        meResponse,
        targetBackend
      );

      // Step 7: Store all auth data
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
