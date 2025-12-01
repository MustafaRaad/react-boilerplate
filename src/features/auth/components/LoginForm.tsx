import { useForm } from '@tanstack/react-form'
import { useRouter } from '@tanstack/react-router'
import { Loader2, LockKeyhole, Mail } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FormField } from '@/shared/components/form/FormField'
import { useLogin } from '@/features/auth/api/useLogin'
import { type LoginFormValues } from '@/features/auth/types'
import { useAuthStore } from '@/store/auth.store'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const LoginForm = () => {
  const { t } = useTranslation()
  const loginMutation = useLogin()
  const router = useRouter()
  const { user, isInitializing } = useAuthStore()

  useEffect(() => {
    if (!isInitializing && user) {
      router.navigate({ to: '/dashboard', replace: true })
    }
  }, [isInitializing, user, router])

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    } satisfies LoginFormValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = loginSchema.safeParse(value)
        if (!result.success) {
          return result.error.format()
        }
        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      await loginMutation.mutateAsync(value)
      router.navigate({ to: '/dashboard', replace: true })
    },
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background px-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <LockKeyhole className="h-6 w-6 text-primary" />
            {t('common.auth.title')}
          </CardTitle>
          <CardDescription>{t('common.welcome')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault()
              void form.handleSubmit()
            }}
          >
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  const result = loginSchema.shape.email.safeParse(value)
                  return result.success ? undefined : result.error.issues[0]?.message
                },
              }}
            >
              {(field) => (
                <FormField field={field} label={t('common.auth.email')}>
                  <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-ring">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={t('common.auth.email')}
                    className="border-0 px-0 shadow-none focus-visible:ring-0"
                    type="email"
                    />
                  </div>
                </FormField>
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => {
                  const result = loginSchema.shape.password.safeParse(value)
                  return result.success ? undefined : result.error.issues[0]?.message
                },
              }}
            >
              {(field) => (
                <FormField field={field} label={t('common.auth.password')}>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="••••••••"
                    type="password"
                  />
                </FormField>
              )}
            </form.Field>

            <Button type="submit" className="w-full gap-2" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t('common.auth.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
