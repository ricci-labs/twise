import { cva } from 'class-variance-authority'

export const entryHeaderVariants = cva(
  'flex flex-col gap-1.5 rounded-xl border border-border bg-surface p-4.5',
)

export const entryHeaderTopVariants = cva('mb-1 flex items-center gap-3')

export const entryHeaderTypeVariants = cva('block text-caption font-semibold text-ink-muted')

export const entryHeaderTitleVariants = cva('font-display text-title text-ink')

export const entryHeaderAmountVariants = cva('font-display text-display', {
  variants: {
    direction: {
      out: 'text-ink',
      in: 'text-mint-ink',
      neutral: 'text-ink',
    },
  },
  defaultVariants: { direction: 'out' },
})

export const entryHeaderDetailVariants = cva('text-body-sm font-medium text-ink-muted')
