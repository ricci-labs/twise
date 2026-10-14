import { cva } from 'class-variance-authority'

export const emptyBlockVariants = cva(
  'flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface px-6 pt-7 text-center text-body-sm text-ink-muted',
  {
    variants: {
      hasText: {
        true: 'pb-7',
        false: 'pb-8.5',
      },
    },
    defaultVariants: { hasText: true },
  },
)

export const emptyBlockTitleVariants = cva('text-lead text-ink')

export const emptyBlockActionVariants = cva('mt-3')
