import { cva } from 'class-variance-authority'

export const dateBlockVariants = cva(
  'flex shrink-0 flex-col items-center justify-center rounded-md',
  {
    variants: {
      tone: {
        default: 'bg-sunken text-ink',
        overdue: 'bg-danger-soft text-danger',
        past: 'bg-transparent text-ink-subtle inset-ring-1 inset-ring-border',
        next: 'bg-action-primary text-on-action-primary',
      },
      size: {
        md: 'h-11.5 w-10.5',
        lg: 'h-16 w-15',
      },
    },
    defaultVariants: { tone: 'default', size: 'md' },
  },
)

export const dateBlockDayVariants = cva('font-display tabular-nums', {
  variants: {
    size: {
      md: 'text-card-title font-bold',
      lg: 'text-form-title-lg',
    },
  },
  defaultVariants: { size: 'md' },
})

export const dateBlockMonthVariants = cva('font-semibold tracking-wide uppercase', {
  variants: {
    tone: {
      default: 'text-ink-muted',
      overdue: 'text-danger',
      past: 'text-ink-muted',
      next: 'text-on-action-primary',
    },
    size: {
      md: 'text-badge-tiny',
      lg: 'text-caption',
    },
  },
  defaultVariants: { tone: 'default', size: 'md' },
})
