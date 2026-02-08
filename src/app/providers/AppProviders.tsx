/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { I18nextProvider } from "react-i18next";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "next-themes";
import { router } from "@/app/router/routeTree";
import { queryClient } from "@/core/api/queryClient";
import { i18n } from "@/core/i18n/i18n";
import { useDirection } from "@/shared/hooks/useDirection";
import { Toaster } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

const DirectionObserver = () => {
  useDirection();
  return null;
};

export const AppProviders = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <DirectionObserver />
            <RouterProvider router={router} />
            <Toaster richColors />
            {import.meta.env.DEV ? (
              <ReactQueryDevtools initialIsOpen={false} />
            ) : null}
            {import.meta.env.DEV ? (
              <TanStackRouterDevtools router={router} position="bottom-right" />
            ) : null}
          </TooltipProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </ThemeProvider>
  );
};
