import { cva } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-caption font-semibold whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'bg-sunken text-ink',
        info: 'bg-info-soft text-info',
        success: 'bg-success-soft text-success',
        warning: 'bg-warning-soft text-warning',
        danger: 'bg-danger-soft text-danger',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)
