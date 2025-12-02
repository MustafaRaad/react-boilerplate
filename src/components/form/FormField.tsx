import { type AnyFieldApi } from '@tanstack/form-core'
import { type ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type FormFieldProps = {
  field: AnyFieldApi
  label?: string
  className?: string
  children: ReactNode
}

export const FormField = ({ field, label, className, children }: FormFieldProps) => {
  const error = field.state.meta.errors?.[0]?.message as string | undefined
  return (
    <div className={cn('space-y-2', className)}>
      {label ? (
        <Label htmlFor={field.name} className="flex justify-between text-sm font-medium">
          <span>{label}</span>
        </Label>
      ) : null}
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
