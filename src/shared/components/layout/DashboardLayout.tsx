import { Suspense } from "react";
import { Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { DashboardHeader } from "@/shared/components/layout/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { ErrorBoundary } from "@/shared/components/error/ErrorBoundary";
import { SkipToContent } from "@/shared/components/a11y/SkipToContent";
import { KeyboardShortcuts } from "@/shared/components/a11y/KeyboardShortcuts";
import { ColorContrastAudit } from "@/shared/components/a11y/ColorContrastAudit";
import { Loader } from "lucide-react";

const LoadingFallback = () => (
  <div className="flex h-[50vh] items-center justify-center">
    <Loader className="size-12 animate-spin text-secondary" />
  </div>
);

export const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <SkipToContent />
      <KeyboardShortcuts />
      <ColorContrastAudit />
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main
          id="main-content"
          className="@container/main flex flex-1 flex-col gap-2 p-2 md:p-6"
        >
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
