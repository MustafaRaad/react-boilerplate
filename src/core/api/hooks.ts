import { useEffect } from 'react'
import {
  useMutation,
  useQuery,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { notifyError, notifySuccess } from '@/core/api/notifications'
import { type UnifiedApiError } from '@/core/types/api'

type ApiQueryOptions<TQueryFnData, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey> =
  UseQueryOptions<TQueryFnData, UnifiedApiError, TData, TQueryKey> & {
    toastOnError?: boolean
  }

export const useApiQuery = <
  TQueryFnData,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: ApiQueryOptions<TQueryFnData, TData, TQueryKey>,
) => {
  const { toastOnError = true, ...rest } = options
  const queryResult = useQuery(rest)

  useEffect(() => {
    if (toastOnError && queryResult.error) {
      notifyError(queryResult.error)
    }
  }, [queryResult.error, toastOnError])

  return queryResult
}

type ApiMutationOptions<TData, TVariables, TContext = unknown> = UseMutationOptions<
  TData,
  UnifiedApiError,
  TVariables,
  TContext
> & {
  successMessageKey?: string
  toastOnError?: boolean
}

export const useApiMutation = <TData, TVariables, TContext = unknown>(
  options: ApiMutationOptions<TData, TVariables, TContext>,
) => {
  const { successMessageKey, toastOnError = true, ...rest } = options

  return useMutation({
    ...rest,
    onSuccess: (data, variables, context, mutation) => {
      if (successMessageKey) {
        notifySuccess(successMessageKey)
      }
      rest.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      if (toastOnError) {
        notifyError(error)
      }
      rest.onError?.(error, variables, context, mutation)
    },
  })
}
