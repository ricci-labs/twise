import { cva } from 'class-variance-authority'

export const comingMonthsBarsVariants = cva('flex flex-col gap-3 tabular-nums')

export const comingMonthsLegendVariants = cva(
  'flex flex-wrap gap-x-4 gap-y-1 text-caption font-normal text-ink-muted',
)

export const comingMonthsSwatchVariants = cva('inline-block shrink-0', {
  variants: {
    kind: {
      committed: 'size-2.5 rounded-swatch bg-chart-4',
      purchase: 'size-2.5 rounded-swatch bg-chart-3',
      reference: 'h-0.5 w-3.5 rounded-full bg-warning',
    },
  },
})

export const comingMonthRowVariants = cva('flex items-center gap-2.5')

export const comingMonthLabelVariants = cva('w-13 shrink-0 text-note font-medium', {
  variants: {
    isChanged: {
      true: 'text-ink',
      false: 'text-ink-muted',
    },
  },
})

export const comingMonthTrackVariants = cva('flex min-w-0 flex-1 items-center')

export const comingMonthSvgVariants = cva('h-5 min-w-0 flex-1 overflow-visible')

export const comingMonthBeforeVariants = cva('fill-chart-4', {
  variants: {
    isChanged: {
      true: '',
      false: 'opacity-35',
    },
  },
})

export const comingMonthOverVariants = cva('-ml-0.5 size-4 shrink-0 fill-chart-3 text-chart-3')

export const comingMonthValueVariants = cva(
  'w-24 shrink-0 text-right text-note whitespace-nowrap',
  {
    variants: {
      isChanged: {
        true: 'text-ink',
        false: 'text-ink-subtle',
      },
    },
  },
)

export const comingMonthAfterVariants = cva('font-bold', {
  variants: {
    isHigh: {
      true: 'text-warning',
      false: '',
    },
  },
})
