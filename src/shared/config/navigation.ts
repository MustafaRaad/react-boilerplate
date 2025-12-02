import { LayoutDashboard, Users, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AppNavItem = {
  label: string;
  href: string;
  icon?: LucideIcon;
  feature?: string;
  children?: AppNavItem[];
};

export const mainNavItems: AppNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    feature: "dashboard",
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: Users,
    feature: "users",
  },
  {
    label: "Roles",
    href: "/dashboard/roles",
    icon: Shield,
    feature: "roles",
  },
];
