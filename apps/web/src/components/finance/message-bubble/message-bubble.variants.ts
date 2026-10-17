import { cva } from 'class-variance-authority'

export const messageBubbleVariants = cva(
  'flex flex-col gap-0.5 rounded-bubble rounded-tl-bubble-tail bg-mint-soft px-3.5 py-3 text-body-sm text-ink',
)

export const messageBubbleLineVariants = cva('m-0 wrap-anywhere')

export const messageBubblePixVariants = cva('m-0 font-mono text-code wrap-anywhere text-ink-muted')
