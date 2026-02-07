import { RiDashboardLine, RiGroupLine, RiArrowUpLine } from "@remixicon/react";
import type { ComponentType } from "react";

export type AppNavItem = {
  label: string;
  href: string;
  icon?: ComponentType<{ className?: string }>;
  feature?: string;
  children?: AppNavItem[];
};

export const mainNavItems: AppNavItem[] = [
  {
    label: "navigation.dashboard",
    href: "/dashboard",
    icon: RiDashboardLine,
    feature: "dashboard",
  },
  {
    label: "navigation.users",
    href: "/dashboard/users",
    icon: RiGroupLine,
    feature: "users",
  },
  {
    label: "navigation.statistics",
    href: "/dashboard/statistics",
    icon: RiArrowUpLine,
    feature: "statistics",
  },
];
