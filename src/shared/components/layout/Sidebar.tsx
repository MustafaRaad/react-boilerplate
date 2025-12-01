import { Link, useRouterState } from '@tanstack/react-router'
import { LayoutDashboard, Shield, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/ui.store'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'common.navigation.dashboard' },
  { to: '/dashboard/users', icon: Users, labelKey: 'common.navigation.users' },
  { to: '/dashboard/roles', icon: Shield, labelKey: 'common.navigation.roles' },
]

export const Sidebar = () => {
  const { t } = useTranslation()
  const { isSidebarOpen } = useUiStore()
  const { location } = useRouterState()

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 w-64 shrink-0 border-e bg-card/90 backdrop-blur transition-transform lg:static lg:block lg:translate-x-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        !isSidebarOpen && 'lg:w-20',
      )}
    >
      <div className="flex h-16 items-center gap-2 px-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10" />
        <div className={cn('text-lg font-bold tracking-tight text-foreground', !isSidebarOpen && 'hidden')}>
          {t('common.appName')}
        </div>
      </div>
      <nav className="space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = location.pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10',
                active ? 'bg-primary/10 text-primary' : 'text-foreground/80',
              )}
            >
              <Icon className="h-5 w-5" />
              <span className={cn(!isSidebarOpen && 'hidden')}>{t(item.labelKey)}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
