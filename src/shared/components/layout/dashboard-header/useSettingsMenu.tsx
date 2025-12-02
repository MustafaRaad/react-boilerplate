import { useCallback, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth.store";
import { useMe } from "@/features/auth/api/useMe";
import { type AuthUser } from "@/features/auth/types/auth.types";
import type { MenuLink } from "./types";

export function useSettingsMenu() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { clearAuth, user: authUser } = useAuthStore();

  const [open, setOpen] = useState(false);

  // Prefer stored /me data over auth store if available
  const { data: meData } = useMe();
  const user = (meData ?? authUser) as AuthUser | null;
  const displayName =
    user?.name || user?.email || t("header.user", "User");
  const displayRole =
    user?.roles
      ?.map((r) => r.name)
      .filter(Boolean)
      .join(", ") || t("header.roleFallback", "-");
  const userImage = (user as AuthUser & { image?: string })?.image;

  const go = useCallback(
    (href: string) => () => {
      router.navigate({ to: href });
    },
    [router]
  );

  const items: MenuLink[] = useMemo(
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

  return {
    open,
    setOpen,
    displayName,
    displayRole,
    userImage,
    items,
    go,
    handleSignOut,
    t,
  };
}
