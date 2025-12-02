import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { useRouterState } from "@tanstack/react-router";
import { mainNavItems } from "@/shared/config/navigation";

export function SiteHeader() {
  const { location } = useRouterState();

  // Find the current page title based on the route
  const currentItem = mainNavItems.find((item) =>
    item.href === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(item.href)
  );

  const pageTitle = currentItem?.label || "Dashboard";

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{pageTitle}</h1>
      </div>
    </header>
  );
}
