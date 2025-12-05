import { Suspense } from "react";
import { Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { DashboardHeader } from "@/shared/components/layout/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { Loader } from "lucide-react";

const LoadingFallback = () => (
  <div className="flex h-[50vh] items-center justify-center">
    <Loader className="size-12 animate-spin text-secondary" />
  </div>
);

export const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="@container/main flex flex-1 flex-col gap-2 p-2 md:p-6">
          <Suspense fallback={<LoadingFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
