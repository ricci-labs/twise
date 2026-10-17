import { cva } from 'class-variance-authority'

export const contactHeaderVariants = cva(
  'flex min-w-0 flex-col gap-1.5 rounded-xl border border-border bg-surface p-4.5',
)

export const contactHeaderTopVariants = cva('mb-1 flex items-center gap-3')

export const contactHeaderTypeVariants = cva('block text-caption font-semibold text-ink-muted')

export const contactHeaderNameVariants = cva('font-display text-title break-words text-ink')

export const contactHeaderLabelVariants = cva('mt-3.5 text-note font-semibold text-ink-muted')

export const contactHeaderAmountVariants = cva('font-display text-display', {
  variants: {
    tone: {
      owes: 'text-ink',
      credit: 'text-mint-ink',
      settled: 'text-ink-muted',
    },
  },
  defaultVariants: { tone: 'owes' },
})

export const contactHeaderSentenceVariants = cva('text-body-sm font-medium text-ink-muted')

export const contactHeaderOptOutVariants = cva(
  'mt-2.5 flex w-fit items-center gap-1.5 rounded-full bg-sunken px-2.5 py-1.5 text-caption text-ink [&_svg]:size-3.75 [&_svg]:shrink-0',
)
