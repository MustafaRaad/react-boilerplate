import { Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { SiteHeader } from "@/shared/components/layout/SiteHeader";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";

export const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
