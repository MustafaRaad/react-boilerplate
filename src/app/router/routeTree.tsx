import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { UsersListPage } from '@/features/users/pages/UsersListPage'
import { RolesListPage } from '@/features/roles/pages/RolesListPage'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorPage } from '@/components/layout/ErrorPage'
import { NotFoundPage } from '@/components/layout/NotFoundPage'
import { Overview } from '@/features/dashboard/components/Overview'
import { useAuthGuard } from '@/features/auth/hooks/useAuthGuard'
import { useAuthStore } from '@/store/auth.store'
import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'

const RootComponent = () => <Outlet />

const ProtectedDashboard = () => {
  useAuthGuard()
  return <DashboardLayout />
}

const RootIndex = () => {
  const { user, isInitializing } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isInitializing) return
    router.navigate({ to: user ? '/dashboard' : '/login', replace: true })
  }, [router, user, isInitializing])

  return null
}

const rootRoute = createRootRoute({
  component: RootComponent,
  errorComponent: ({ error }) => <ErrorPage error={error} />,
})

const rootIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: RootIndex,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: ProtectedDashboard,
})

const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/',
  component: Overview,
})

const usersRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'users',
  component: UsersListPage,
})

const rolesRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'roles',
  component: RolesListPage,
})

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFoundPage,
})

const routeTree = rootRoute.addChildren([
  rootIndexRoute,
  loginRoute,
  dashboardRoute.addChildren([dashboardIndexRoute, usersRoute, rolesRoute]),
  notFoundRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
