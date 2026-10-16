import { cva } from 'class-variance-authority'

export const occurrenceGroupVariants = cva('flex flex-col gap-1.5')

export const occurrenceGroupHeadVariants = cva('flex min-h-7 items-center justify-between gap-3')

export const occurrenceGroupTitleVariants = cva(
  'flex min-h-7 items-center gap-2 font-display text-section-title',
  {
    variants: {
      tone: {
        default: 'text-ink',
        danger: 'text-danger',
      },
    },
    defaultVariants: { tone: 'default' },
  },
)

export const occurrenceGroupAddVariants = cva(
  'inline-flex shrink-0 items-center gap-1 text-label [&_svg]:size-4 [&_svg]:no-underline',
)

export const occurrenceGroupCountVariants = cva(
  'font-sans text-row-detail font-medium text-ink-muted',
)

export const occurrenceGroupListVariants = cva('flex flex-col rounded-xl border bg-surface', {
  variants: {
    tone: {
      default: 'border-border px-3',
      danger: 'border-danger px-4 py-1.5 inset-ring-1 inset-ring-danger',
    },
  },
  defaultVariants: { tone: 'default' },
})
