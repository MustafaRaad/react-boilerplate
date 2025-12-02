import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useUiStore } from "@/store/ui.store";

export const DashboardLayout = () => {
  const { isSidebarOpen, closeSidebar } = useUiStore();

  return (
    <div className="flex min-h-screen bg-muted/30 text-foreground">
      <Sidebar />
      {isSidebarOpen ? (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          role="presentation"
          onClick={closeSidebar}
        />
      ) : null}
      <div className="flex min-h-screen flex-1 flex-col">
        <Header />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
