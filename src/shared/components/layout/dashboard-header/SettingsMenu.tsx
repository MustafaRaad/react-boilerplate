import { memo } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useDirection } from "@/shared/hooks/useDirection";
import { useSettingsMenu } from "./useSettingsMenu";
import { UserAvatar } from "./UserAvatar";
import { UserProfileSection } from "./UserProfileSection";
import type { MenuRowProps, SettingsMenuTriggerProps } from "./types";

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

const SettingsMenuTrigger = memo(function SettingsMenuTrigger({
  userImage,
  displayName,
  settingsLabel,
}: SettingsMenuTriggerProps) {
  return (
    <DropdownMenuTrigger asChild>
      <Button
        className="transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 bg-sidebar"
        size="sm"
        variant="outline"
      >
        <UserAvatar src={userImage} alt={displayName} />
        <div className="hidden md:grid flex-1 text-start text-sm leading-tight mx-2">
          <span className="truncate font-medium">{settingsLabel}</span>
        </div>
        <ChevronDown className="ms-auto h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
  );
});

export default memo(function SettingsMenu() {
  const { dir } = useDirection();
  const {
    open,
    setOpen,
    displayName,
    displayRole,
    userImage,
    items,
    go,
    handleSignOut,
    t,
  } = useSettingsMenu();

  return (
    <DropdownMenu dir={dir} open={open} onOpenChange={setOpen}>
      <SettingsMenuTrigger
        userImage={userImage}
        displayName={displayName}
        settingsLabel={t("header.settings")}
      />

      <DropdownMenuContent
        className="w-44 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <UserProfileSection
          userImage={userImage}
          displayName={displayName}
          displayRole={displayRole}
        />
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
