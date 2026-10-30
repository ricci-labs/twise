import type { AlertProps, AlertTone } from '@web/components/feedback/alert/alert.types'
import { alertBodyVariants, alertVariants } from '@web/components/feedback/alert/alert.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { cn } from '@web/lib/cn'
import { CircleAlert, CircleCheck, Info, type LucideIcon, TriangleAlert } from 'lucide-react'

const TONE_ICONS: Record<AlertTone, LucideIcon> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
  neutral: Info,
}

export function Alert({ tone, isUrgent = false, icon, action, children, className }: AlertProps) {
  const Icon = TONE_ICONS[tone]
  return (
    <div
      data-slot="alert"
      role={isUrgent ? 'alert' : 'status'}
      className={cn(alertVariants({ tone }), className)}
    >
      {icon ? <TwiseIcon name={icon} size="sm" /> : <Icon aria-hidden="true" />}
      <div className={alertBodyVariants()}>
        <p>{children}</p>
        {action}
      </div>
    </div>
  )
}
