import { memo, useCallback, useMemo, useState } from "react";
import {
  ChevronDown,
  Languages,
  LogOut,
  Moon,
  ShieldCheck,
  Sun,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useDirection } from "@/shared/hooks/useDirection";
import { useAuthStore } from "@/store/auth.store";
import { UserAvatar } from "./UserAvatar";
import { UserProfileSection } from "./UserProfileSection";
import type { MenuLink } from "./types";

export default memo(function SettingsMenu() {
  const router = useRouter();
  const { t, i18n } = useTranslation("common");
  const { dir } = useDirection();
  const { clearAuth, user } = useAuthStore();
  const { theme, setTheme } = useTheme();

  const [open, setOpen] = useState(false);

  const currentLanguage = i18n.language || "en";

  const currentUser = user;
  const displayName = currentUser?.name || t("header.user");
  const displayEmail = currentUser?.email ?? "user@example.com";
  const userImage = currentUser?.image || undefined;

  const handleNavigate = useCallback(
    (href: string) => () => router.navigate({ to: href }),
    [router]
  );

  const menuItems: MenuLink[] = useMemo(
    () => [
      {
        label: t("header.SettingsMenu.account"),
        icon: <ShieldCheck className="h-4 w-4" />,
        href: "/dashboard/settings/account",
      },
    ],
    [t]
  );

  const handleSignOut = useCallback(() => {
    clearAuth();
    router.navigate({ to: "/login" });
  }, [clearAuth, router]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const changeLanguage = useCallback(
    (langCode: string) => {
      void i18n.changeLanguage(langCode);
    },
    [i18n]
  );

  return (
    <DropdownMenu dir={dir} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          className="transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 bg-sidebar"
          size="sm"
          variant="outline"
        >
          <UserAvatar src={userImage} alt={displayName} />
          <div className="hidden md:grid flex-1 text-start text-sm leading-tight mx-2">
            <span className="truncate font-medium">{displayName}</span>
          </div>
          <ChevronDown className="ms-auto h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-44 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <UserProfileSection
          userImage={userImage}
          displayName={displayName}
          displayEmail={displayEmail}
        />
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.label}
              onClick={handleNavigate(item.href)}
              className="gap-2"
            >
              {item.icon}
              {t(item.label)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuItem onClick={toggleTheme} className="gap-2">
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          {theme === "dark" ? t("theme.light") : t("theme.dark")}
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Languages className="h-4 w-4 me-2" />
            {t("language.switch")}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={currentLanguage}
                onValueChange={changeLanguage}
              >
                <DropdownMenuRadioItem value="en">
                  English
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="ar">
                  العربية
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="gap-2">
          <LogOut className="h-4 w-4" />
          {t("auth.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
