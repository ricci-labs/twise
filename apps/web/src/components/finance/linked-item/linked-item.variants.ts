import { cva } from 'class-variance-authority'

export const linkedItemVariants = cva(
  'flex min-h-13 items-center gap-2.5 rounded-xl border px-4 text-body-sm font-medium text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus-ring [&>svg]:size-4.5 [&>svg]:shrink-0',
  {
    variants: {
      tone: {
        plain: 'border-border bg-surface hover:bg-sunken [&>svg]:text-ink-muted',
        mint: 'border-mint bg-mint-soft hover:bg-mint [&>svg]:text-mint-ink',
      },
    },
    defaultVariants: { tone: 'plain' },
  },
)

export const linkedItemTextVariants = cva('min-w-0 flex-1')
