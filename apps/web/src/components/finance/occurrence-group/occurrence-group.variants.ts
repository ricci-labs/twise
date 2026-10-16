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

export const occurrenceGroupListVariants = cva('flex flex-col', {
  variants: {
    tone: {
      default: '',
      danger: '',
    },
    layout: {
      list: 'rounded-xl border bg-surface',
      cards: 'gap-2.5 lg:grid lg:grid-cols-3 lg:gap-4',
    },
  },
  compoundVariants: [
    { layout: 'list', tone: 'default', class: 'border-border px-3' },
    {
      layout: 'list',
      tone: 'danger',
      class: 'border-danger px-4 py-1.5 inset-ring-1 inset-ring-danger',
    },
  ],
  defaultVariants: { tone: 'default', layout: 'list' },
})
