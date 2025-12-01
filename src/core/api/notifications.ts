import { i18n } from '@/core/i18n/i18n'
import { type UnifiedApiError } from '@/core/types/api'
import { toast } from 'sonner'

export const notifySuccess = (messageKeyOrText: string) => {
  const message = i18n.t(messageKeyOrText)
  toast.success(message)
}

export const notifyError = (error: UnifiedApiError) => {
  const message = error?.message ?? i18n.t('common.errors.unexpected')
  toast.error(message)
}
