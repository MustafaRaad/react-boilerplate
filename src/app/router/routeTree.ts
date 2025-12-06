/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { lazy } from "react";
import { NotFoundPage } from "@/shared/components/layout/NotFoundPage";
import { Overview } from "@/features/dashboard/components/Overview";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import {
  ProtectedDashboard,
  RootComponent,
  RootIndex,
} from "./routeComponents";

// ✅ Lazy load feature pages for better code splitting
const UsersListPage = lazy(() => import("@/features/users/pages/UsersListPage").then(m => ({ default: m.UsersListPage })));
const StatisticsPage = lazy(() => import("@/features/statistics/pages/StatisticsPage").then(m => ({ default: m.StatisticsPage })));

// Error boundary wrapper

const rootRoute = createRootRoute({
  component: RootComponent,
});

const rootIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: RootIndex,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: ProtectedDashboard,
});

const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/",
  component: Overview,
});

const usersRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "users",
  component: UsersListPage,
});

const statisticsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "statistics",
  component: StatisticsPage,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: NotFoundPage,
});

const routeTree = rootRoute.addChildren([
  rootIndexRoute,
  loginRoute,
  dashboardRoute.addChildren([
    dashboardIndexRoute,
    usersRoute,
    statisticsRoute,
  ]),
  notFoundRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
