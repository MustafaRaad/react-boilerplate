import { memo } from "react";
import { UserRound } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import type { UserAvatarProps } from "./types";

export const UserAvatar = memo(function UserAvatar({
  src,
  alt,
  size = "sm",
}: Omit<UserAvatarProps, "fallbackText">) {
  const sizeClass = size === "md" ? "h-8 w-8" : "h-6 w-6";

  return (
    <Avatar className={`${sizeClass} rounded-lg`}>
      {src && <AvatarImage src={src} alt={alt} />}
      <AvatarFallback className="rounded-lg">
        <UserRound className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
  );
});
