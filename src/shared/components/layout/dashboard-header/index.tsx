import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { Breadcrumbs } from "./Breadcrumbs";
import Notifications from "./Notifications";
import SettingsMenu from "./HeaderActionsMenu";

export function DashboardHeader() {
  const { t } = useTranslation("common");

  return (
    <header className="flex justify-between bg-sidebar sticky top-0 z-50 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear px-4 lg:px-6">
      <div className="flex gap-1 lg:gap-2 items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger className="-ml-1" />
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{t("header.toggleSidebar")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumbs />
      </div>
      <div className="flex gap-1 lg:gap-2">
        <Notifications />
        <SettingsMenu />
      </div>
    </header>
  );
}
