/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

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
