import { cva } from 'class-variance-authority'

export const kpiCardVariants = cva(
  'relative flex min-h-full flex-col gap-1.5 overflow-hidden rounded-lg border px-5 py-4.5',
  {
    variants: {
      tone: {
        plain: 'border-border bg-surface text-ink [&_[data-slot=kpi-label]]:text-ink-muted',
        mint: 'border-mint bg-mint text-on-mint',
        danger: 'border-danger-soft bg-danger-soft text-ink [&_[data-slot=kpi-value]]:text-danger',
      },
    },
    defaultVariants: { tone: 'plain' },
  },
)

export const kpiBadgeVariants = cva(
  'inline-flex h-6 items-center rounded-full border px-2.5 text-caption font-semibold tabular-nums whitespace-nowrap',
  {
    variants: {
      tone: {
        plain: 'border-border bg-surface text-ink',
        onMint: 'border-on-mint bg-on-mint text-mint',
        danger: 'border-danger bg-danger text-on-action-primary',
      },
    },
    defaultVariants: { tone: 'plain' },
  },
)
