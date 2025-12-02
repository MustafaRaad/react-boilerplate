import type { ReactNode } from "react";

export interface HeaderNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  unread?: boolean;
}

export interface HeaderUserData {
  name: string | null;
  email: string | null;
  image: string | null;
  role: string | null;
}

export interface MenuLink {
  label: string;
  href: string;
  icon?: ReactNode;
}

export interface MenuRowProps {
  icon: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}

export interface UserAvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md";
}

export interface SettingsMenuTriggerProps {
  userImage?: string;
  displayName: string;
  settingsLabel: string;
}

export interface UserProfileSectionProps {
  userImage?: string;
  displayName: string;
  displayRole: string;
}
