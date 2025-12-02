import { memo } from "react";
import { DropdownMenuLabel } from "@/shared/components/ui/dropdown-menu";
import { UserAvatar } from "./UserAvatar";
import type { UserProfileSectionProps } from "./types";

export const UserProfileSection = memo(function UserProfileSection({
  userImage,
  displayName,
  displayRole,
}: UserProfileSectionProps) {
  return (
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
  );
});
