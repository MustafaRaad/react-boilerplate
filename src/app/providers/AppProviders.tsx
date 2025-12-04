import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { I18nextProvider } from "react-i18next";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { router } from "@/app/router/routeTree";
import { queryClient } from "@/core/api/queryClient";
import { i18n } from "@/core/i18n/i18n";
import { useDirection } from "@/shared/hooks/useDirection";
import { Toaster } from "@/shared/components/ui/sonner";

const DirectionObserver = () => {
  useDirection();
  return null;
};

export const AppProviders = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <DirectionObserver />
        <RouterProvider router={router} />
        <Toaster richColors />
        {import.meta.env.DEV ? (
          <ReactQueryDevtools initialIsOpen={false} />
        ) : null}
        {import.meta.env.DEV ? (
          <TanStackRouterDevtools router={router} position="bottom-right" />
        ) : null}
      </QueryClientProvider>
    </I18nextProvider>
  );
};
