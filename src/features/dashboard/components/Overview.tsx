import { TrendingUp, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Overview = () => {
  const { t } = useTranslation()

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t('common.dashboard.overview')}
          </CardTitle>
          <CardDescription>{t('common.dashboard.quickStats')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('common.dashboard.monthlyActive')}</p>
              <p className="text-2xl font-semibold">12.4k</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">+8.2%</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            {t('common.users.title')}
          </CardTitle>
          <CardDescription>{t('common.users.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('common.users.title')}</p>
              <p className="text-2xl font-semibold">248</p>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
              {t('common.dashboard.newUsers')}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
