import { endpoints } from '@/core/api/endpoints'
import { apiFetch } from '@/core/api/client'
import { useApiMutation } from '@/core/api/hooks'
import { backendKind } from '@/core/config/env'
import { type AuthTokens, type AuthUser, type LoginResultAspNet } from '@/core/types/auth'
import { useAuthStore } from '@/store/auth.store'
import { type LoginFormValues } from '@/features/auth/types'

export const useLogin = () => {
  return useApiMutation<AuthUser, LoginFormValues>({
    mutationFn: async (values) => {
      const store = useAuthStore.getState()

      if (backendKind === 'aspnet') {
        const loginResult = await apiFetch<LoginResultAspNet>(endpoints.auth.loginAspNet, {
          body: values,
        })

        const tokens: AuthTokens = {
          accessToken: loginResult.accessToken,
          refreshToken: loginResult.refreshToken,
        }

        const user = await apiFetch<AuthUser>(endpoints.auth.me, {
          overrideBackendKind: 'aspnet',
        })
        store.setAuth({ user, tokens })
        return user
      }

      const tokens = (await apiFetch<AuthTokens>(endpoints.auth.loginLaravel, {
        body: values,
        overrideBackendKind: 'laravel',
      })) as AuthTokens

      const user = await apiFetch<AuthUser>(endpoints.auth.me, {
        overrideBackendKind: 'laravel',
      })

      store.setAuth({ user, tokens })
      return user
    },
    successMessageKey: 'common.toasts.success',
  })
}
