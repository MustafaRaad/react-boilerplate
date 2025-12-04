import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { NotFoundPage } from "@/shared/components/layout/NotFoundPage";
import { Overview } from "@/features/dashboard/components/Overview";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { UsersListPage } from "@/features/users/pages/UsersListPage";
import { RolesListPage } from "@/features/roles/pages/RolesListPage";
import { StatisticsPage } from "@/features/statistics/pages/StatisticsPage";
import {
  ProtectedDashboard,
  RootComponent,
  RootIndex,
} from "./routeComponents";

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

const rolesRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "roles",
  component: RolesListPage,
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
    rolesRoute,
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
