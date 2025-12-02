import type { ReactNode } from "react";
import type { AuthUser } from "@/features/auth/types/auth.types";

export interface HeaderNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  unread?: boolean;
}

export type HeaderUserData = Pick<
  AuthUser,
  "name" | "email" | "image" | "role" | "phoneNo"
>;

export interface MenuLink {
  label: string;
  href: string;
  icon?: ReactNode;
}

export interface UserAvatarProps {
  src?: string;
  alt: string;
  fallbackText?: string;
  size?: "sm" | "md";
}


export interface UserProfileSectionProps {
  userImage?: string;
  displayName: string;
  displayEmail?: string;
  fallbackText?: string;
}