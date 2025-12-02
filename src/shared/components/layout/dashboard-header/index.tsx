import { Menu } from "lucide-react";
import { useUiStore } from "@/store/ui.store";
import Notifications from "./Notifications";
import SettingsMenu from "./SettingsMenu";
import { Button } from "../../ui/button";

export const DashboardHeader = () => {
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Notifications />
        <SettingsMenu />
      </div>
    </header>
  );
};
