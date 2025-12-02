import { memo, useCallback, useMemo, useState } from "react";
import { ChevronDown, LogOut, Moon, ShieldCheck, Sun, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useDirection } from "@/shared/hooks/useDirection";
import { useAuthStore } from "@/store/auth.store";
import { useMe } from "@/features/auth/api/useMe";
import { type AuthUser } from "@/features/auth/types/auth.types";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import type { MenuLink, MenuRowProps } from "./types";

const MenuRow = memo(function MenuRow({
  icon,
  children,
  onClick,
}: MenuRowProps) {
  return (
    <DropdownMenuItem onSelect={onClick} className="gap-2">
      {icon}
      {children}
    </DropdownMenuItem>
  );
});

function UserAvatar({
  src,
  alt,
  size = "sm",
}: {
  src?: string;
  alt: string;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "md" ? "h-8 w-8" : "h-6 w-6";

  return (
    <Avatar className={`${sizeClass} rounded-lg`}>
      {src && <AvatarImage src={src} alt={alt} />}
      <AvatarFallback className="rounded-lg">
        <UserRound className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
  );
}

export default memo(function SettingsMenu() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { dir } = useDirection();
  const { clearAuth, user: authUser } = useAuthStore();

  const [open, setOpen] = useState(false);

  // Fetch fresh user data from /me endpoint when dropdown opens
  const { data: meData } = useMe(open);

  // Prefer fresh API data over stored auth data
  const user = (meData ?? authUser) as AuthUser | null;
  const displayName = user?.name ?? t("header.user");
  const displayRole = user?.roles?.[0]?.name ?? "-";
  // Support optional image field (may be added to backend later)
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
            <span className="truncate font-medium">{t("header.settings")}</span>
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
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
            <UserAvatar src={userImage} alt={displayName} size="md" />
            <div className="grid flex-1 ltr:text-start rtl:text-right text-sm leading-tight">
              <span className="truncate font-medium">{displayName}</span>
              <span className="text-muted-foreground truncate text-xs">
                {displayRole}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {items.map((m) => (
            <MenuRow key={m.label} icon={m.icon} onClick={go(m.href)}>
              {m.label}
            </MenuRow>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <MenuRow icon={<LogOut className="h-4 w-4" />} onClick={handleSignOut}>
          {t("auth.logout")}
        </MenuRow>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
