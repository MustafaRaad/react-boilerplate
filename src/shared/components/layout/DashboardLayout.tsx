import { Suspense } from "react";
import { Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { DashboardHeader } from "@/shared/components/layout/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { ErrorBoundary } from "@/shared/mcp/ErrorBoundary";
import { RiLoader4Line } from "@remixicon/react";
import ClickSpark from "../ClickSpark";

const LoadingFallback = () => (
  <div className="flex h-[50vh] items-center justify-center">
    <RiLoader4Line className="size-12 animate-spin text-secondary" />
  </div>
);

export const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ClickSpark
          sparkColor='#c9c9c9'
        >
          <DashboardHeader />
          <main
            id="main-content"
            className="@container/main flex flex-1 flex-col gap-2 p-2 md:p-6"
          >
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <div className="pointer-events-none absolute inset-0 z-100 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </main>
        </ClickSpark>
      </SidebarInset>
    </SidebarProvider>
  );
};
