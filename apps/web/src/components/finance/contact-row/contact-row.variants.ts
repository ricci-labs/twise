import { cva } from 'class-variance-authority'

export const contactRowVariants = cva(
  'relative flex items-start gap-2.5 border-border not-first:border-t',
)

export const contactRowMainVariants = cva(
  'flex min-h-19 min-w-0 flex-1 items-start gap-3 py-3 text-start text-ink outline-none after:absolute after:inset-0 after:rounded-md focus-visible:after:ring-2 focus-visible:after:ring-focus-ring',
)

export const contactRowTextVariants = cva('flex min-w-0 flex-1 flex-col gap-0.5')

export const contactRowNameVariants = cva('line-clamp-2 text-row font-semibold break-words', {
  variants: {
    isArchived: {
      true: 'text-ink-muted',
      false: '',
    },
  },
  defaultVariants: { isArchived: false },
})

export const contactRowAvatarVariants = cva('', {
  variants: {
    isArchived: {
      true: 'opacity-60',
      false: '',
    },
  },
  defaultVariants: { isArchived: false },
})

export const contactRowStateVariants = cva(
  'line-clamp-2 text-row-detail break-words text-ink-muted [&>[data-slot=badge]]:me-1.5 [&>[data-slot=badge]]:align-text-bottom',
)

export const contactRowChannelsVariants = cva(
  'mt-0.5 flex flex-wrap gap-x-2.5 gap-y-1 text-caption font-medium text-ink-muted',
)

export const contactRowChannelVariants = cva('inline-flex items-center gap-1 [&_svg]:size-3.5')

export const contactRowEndVariants = cva('flex shrink-0 flex-col items-end gap-1.5 py-3')

export const contactRowBalanceVariants = cva('flex flex-col items-end')

export const contactRowAmountVariants = cva('text-row font-emphasis whitespace-nowrap', {
  variants: {
    tone: {
      owes: 'text-ink',
      late: 'text-danger',
      credit: 'text-mint-ink',
      settled: 'text-ink-muted',
    },
  },
  defaultVariants: { tone: 'owes' },
})

export const contactRowBalanceLabelVariants = cva('text-caption font-normal text-ink-muted')

export const contactRowChargeVariants = cva('relative')
