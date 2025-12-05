import { LayoutDashboard, Users, TrendingUp } from "lucide-react";
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
    label: "navigation.dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    feature: "dashboard",
  },
  {
    label: "navigation.users",
    href: "/dashboard/users",
    icon: Users,
    feature: "users",
  },
  {
    label: "navigation.statistics",
    href: "/dashboard/statistics",
    icon: TrendingUp,
    feature: "statistics",
  },
];
