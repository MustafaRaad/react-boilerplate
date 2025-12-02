import { Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { DashboardHeader } from "@/shared/components/layout/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";

export const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="@container/main flex flex-1 flex-col gap-2 p-2 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
