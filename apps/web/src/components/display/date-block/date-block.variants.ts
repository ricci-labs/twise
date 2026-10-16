import { cva } from 'class-variance-authority'

export const dateBlockVariants = cva(
  'flex h-11.5 w-10.5 shrink-0 flex-col items-center justify-center rounded-md',
  {
    variants: {
      tone: {
        default: 'bg-sunken text-ink',
        overdue: 'bg-danger-soft text-danger',
        past: 'bg-transparent text-ink-subtle inset-ring-1 inset-ring-border',
        next: 'bg-action-primary text-on-action-primary',
      },
    },
    defaultVariants: { tone: 'default' },
  },
)

export const dateBlockDayVariants = cva('font-display text-card-title font-bold tabular-nums')

export const dateBlockMonthVariants = cva('text-badge-tiny font-semibold tracking-wide uppercase', {
  variants: {
    tone: {
      default: 'text-ink-muted',
      overdue: 'text-danger',
      past: 'text-ink-muted',
      next: 'text-on-action-primary',
    },
  },
  defaultVariants: { tone: 'default' },
})
