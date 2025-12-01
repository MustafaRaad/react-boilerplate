import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout'
import { ErrorPage } from '@/shared/components/layout/ErrorPage'
import { NotFoundPage } from '@/shared/components/layout/NotFoundPage'
import { Overview } from '@/features/dashboard/components/Overview'
import { UsersTable } from '@/features/users/components/UsersTable'
import { RolesTable } from '@/features/roles/components/RolesTable'
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
  component: LoginForm,
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
  component: UsersTable,
})

const rolesRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'roles',
  component: RolesTable,
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
