import { cva } from 'class-variance-authority'

export const beforeAfterTilesVariants = cva('', {
  variants: {
    layout: {
      rows: 'flex flex-col',
      tiles: 'grid grid-cols-3 gap-3',
    },
  },
  defaultVariants: { layout: 'rows' },
})

export const beforeAfterTileVariants = cva('flex min-w-0', {
  variants: {
    layout: {
      rows: 'items-center gap-3 border-border py-3 not-first:border-t',
      tiles: '@container flex-col items-start gap-1 rounded-lg border border-border px-4 py-3.5',
    },
  },
  defaultVariants: { layout: 'rows' },
})

export const beforeAfterTextVariants = cva('', {
  variants: {
    layout: {
      rows: 'flex min-w-0 flex-1 flex-col',
      tiles: 'contents',
    },
  },
  defaultVariants: { layout: 'rows' },
})

export const beforeAfterLabelVariants = cva('line-clamp-2 text-body-sm font-medium break-words', {
  variants: {
    layout: {
      rows: 'text-ink',
      tiles: 'min-h-10 text-ink-muted',
    },
  },
  defaultVariants: { layout: 'rows' },
})

export const beforeAfterValueVariants = cva('font-display whitespace-nowrap tabular-nums', {
  variants: {
    layout: {
      rows: 'shrink-0 text-right text-title font-heavy',
      tiles: 'max-w-full text-tile-amount font-heavy',
    },
    isNegative: {
      true: 'text-danger',
      false: '',
    },
  },
  defaultVariants: { layout: 'rows', isNegative: false },
})

export const beforeAfterBeforeVariants = cva('text-note text-ink-muted tabular-nums', {
  variants: {
    layout: {
      rows: '',
      tiles: 'order-last',
    },
  },
  defaultVariants: { layout: 'rows' },
})
