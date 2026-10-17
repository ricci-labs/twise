import { cva } from 'class-variance-authority'

export const occurrenceGroupVariants = cva('flex flex-col gap-1.5')

export const occurrenceGroupHeadVariants = cva('flex items-center justify-between gap-3', {
  variants: {
    heading: {
      section: 'min-h-7',
      label: 'mx-0.5 mt-1.5',
    },
  },
  defaultVariants: { heading: 'section' },
})

export const occurrenceGroupTitleVariants = cva('flex items-center gap-2', {
  variants: {
    heading: {
      section: 'min-h-7 font-display text-section-title',
      label: 'text-overline uppercase',
    },
    tone: {
      default: '',
      danger: 'text-danger',
    },
  },
  compoundVariants: [
    { heading: 'section', tone: 'default', class: 'text-ink' },
    { heading: 'label', tone: 'default', class: 'text-ink-muted' },
  ],
  defaultVariants: { heading: 'section', tone: 'default' },
})

export const occurrenceGroupAddVariants = cva(
  'inline-flex shrink-0 items-center gap-1 text-label [&_svg]:size-4 [&_svg]:no-underline',
)

export const occurrenceGroupCountVariants = cva(
  'font-sans text-row-detail font-medium text-ink-muted',
)

export const occurrenceGroupNoteVariants = cva('mx-0.5 -mt-0.5 mb-1 text-group-note text-ink-muted')

export const occurrenceGroupEmptyVariants = cva(
  'rounded-xl border border-dashed border-border-control bg-surface p-4 text-body-sm text-ink-muted',
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
