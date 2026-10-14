import { cva } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full text-caption font-semibold whitespace-nowrap',
  {
    variants: {
      size: {
        md: 'h-6 px-2.5',
        sm: 'h-5.5 px-2.25',
        status: 'h-5.5 px-2.5',
        xs: 'h-5 px-2 text-tab font-semibold',
        compact: 'h-5 px-2',
        tiny: 'h-4.5 px-1.5 text-badge-tiny',
      },

      tone: {
        neutral: 'bg-status-neutral-soft text-status-neutral',
        info: 'bg-info-soft text-info',
        success: 'bg-success-soft text-success',
        warning: 'bg-warning-soft text-warning',
        danger: 'bg-danger-soft text-danger',
      },
    },
    defaultVariants: { tone: 'neutral', size: 'md' },
  },
)

export const badgeDotVariants = cva('size-1.5 shrink-0 rounded-full bg-current')
