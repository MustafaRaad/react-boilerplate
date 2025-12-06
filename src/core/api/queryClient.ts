/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds - balance between freshness and performance
      gcTime: 5 * 60 * 1000, // 5 minutes - cache retention (formerly cacheTime)
      retry: false, // Disable React Query retry (we have interceptor retry logic)
      refetchOnWindowFocus: false, // Prevent refetch on window focus
      refetchOnMount: true, // Always fetch fresh data on mount/refresh
      refetchOnReconnect: true, // Refetch when network reconnects
    },
  },
});
