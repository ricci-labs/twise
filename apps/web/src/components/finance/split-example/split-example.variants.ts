import { cva } from 'class-variance-authority'

export const splitExampleVariants = cva(
  'flex flex-col rounded-xl border border-border bg-surface px-4 py-3.5 lg:px-6 lg:py-5',
)

export const splitTitleVariants = cva('mb-2 text-tile-title')

export const splitCustomVariants = cva('mt-3')

export const splitWithVariants = cva(
  'mt-3 text-sub-page text-ink-muted [&>strong]:font-bold [&>strong]:whitespace-nowrap [&>strong]:text-ink',
)

export const splitBarVariants = cva('mt-3.5 block h-3.5 overflow-hidden rounded-full')

export const splitBarSvgVariants = cva('block size-full')

export const splitSegmentVariants = cva('', {
  variants: {
    series: {
      s1: 'fill-mint',
      s2: 'fill-warning-fill',
      s3: 'fill-chart-4',
      s4: 'fill-ink-subtle',
      s5: 'fill-chart-1',
      leftover: 'fill-sunken',
    },
  },
  defaultVariants: { series: 's1' },
})

export const splitRowsVariants = cva('mt-2 flex flex-col gap-2.5')

export const splitRowVariants = cva('flex items-center gap-2 text-body-sm font-medium', {
  variants: {
    isLeftover: {
      true: 'border-t border-border pt-2.5 font-emphasis',
      false: '',
    },
  },
  defaultVariants: { isLeftover: false },
})

export const splitNumberVariants = cva(
  'grid size-5 shrink-0 place-items-center rounded-full text-tag font-bold tabular-nums',
  {
    variants: {
      series: {
        plain: 'bg-sunken text-ink',
        s1: 'bg-mint text-on-mint',
        s2: 'bg-warning-fill text-on-mint',
        s3: 'bg-chart-4 text-on-action-primary',
        s4: 'bg-ink-subtle text-on-action-primary',
        s5: 'bg-chart-1 text-on-action-primary',
      },
    },
    defaultVariants: { series: 'plain' },
  },
)

export const splitLabelVariants = cva('line-clamp-2 min-w-0 break-words')

export const splitLeaderVariants = cva('mt-1 min-w-4 flex-1 self-center dotted-leader')

export const splitAmountVariants = cva('shrink-0 font-emphasis whitespace-nowrap tabular-nums')

export const splitFootnoteVariants = cva('mt-3 text-note text-ink-muted lg:mt-auto lg:pt-3.5')
