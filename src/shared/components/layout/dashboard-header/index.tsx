import { useRouter } from "@tanstack/react-router";
import { Languages, LogOut, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { useUiStore } from "@/store/ui.store";
import Notifications from "./Notifications";

export const DashboardHeader = () => {
  const { t, i18n } = useTranslation();
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const switchLanguage = () => {
    const nextLanguage = i18n.language === "ar" ? "en" : "ar";
    void i18n.changeLanguage(nextLanguage);
  };

  const logout = () => {
    clearAuth();
    router.navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={switchLanguage}
          className="gap-2"
        >
          <Languages className="h-4 w-4" />
          {i18n.language === "ar" ? t("language.en") : t("language.ar")}
        </Button>
        <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
          <LogOut className="h-4 w-4" />
          {t("auth.logout")}
        </Button>
        <Notifications />
      </div>
    </header>
  );
};
