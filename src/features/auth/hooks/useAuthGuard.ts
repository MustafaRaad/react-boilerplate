import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useAuthStore } from '@/store/auth.store'

export const useAuthGuard = () => {
  const router = useRouter()
  const { user, isInitializing } = useAuthStore()

  useEffect(() => {
    if (!isInitializing && !user) {
      router.navigate({ to: '/login', replace: true })
    }
  }, [user, isInitializing, router])

  return { isAuthenticated: !!user, isInitializing }
}
