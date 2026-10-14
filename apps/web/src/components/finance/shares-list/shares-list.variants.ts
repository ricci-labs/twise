import { cva } from 'class-variance-authority'

export const sharesVariants = cva('flex flex-col gap-1.5')

export const sharesHeadVariants = cva('flex flex-wrap items-center justify-between gap-2')

export const sharesTitleVariants = cva('text-label font-medium text-ink')

export const sharesQuickFillsVariants = cva('flex gap-1.5')

export const sharesQuickFillVariants = cva(
  'min-h-8 cursor-pointer rounded-full bg-sunken px-3 text-button-sm font-semibold text-ink outline-none hover:bg-action-secondary-hover focus-visible:ring-2 focus-visible:ring-focus-ring',
)

export const sharesListVariants = cva('mt-1 flex flex-col gap-2')

export const shareRowVariants = cva('flex items-center gap-2.5', {
  variants: {
    isYours: {
      true: 'mt-0.5 border-t-stroke border-dashed border-border pt-3',
      false: '',
    },
  },
  defaultVariants: { isYours: false },
})

export const shareNameVariants = cva('max-w-1/2 truncate text-choice text-ink', {
  variants: {
    isYours: {
      true: 'font-emphasis',
      false: '',
    },
  },
  defaultVariants: { isYours: false },
})

export const shareLeaderVariants = cva('mt-1 min-w-4 flex-1 self-center dotted-leader')

export const shareAmountVariants = cva('w-33 shrink-0')

export const shareYoursValueVariants = cva(
  'w-33 shrink-0 pr-2.5 text-right font-display text-amount-share text-ink',
)

export const shareRemoveVariants = cva(
  'grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-ink-muted outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring [&_svg]:size-4',
)

export const shareGapVariants = cva('w-9 shrink-0')

export const sharesAddVariants = cva(
  'inline-flex min-h-touch cursor-pointer items-center gap-2 self-start rounded-full px-1 text-label text-mint-ink outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-not-allowed disabled:text-ink-subtle [&_svg]:size-4',
)

export const sharesCollapsedVariants = cva(
  'inline-flex min-h-touch cursor-pointer items-center gap-2 self-start rounded-full border-stroke border-dashed border-border-control bg-transparent px-4 text-label text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus-ring [&_svg]:size-4',
)

export const sharesErrorVariants = cva(
  'flex items-start gap-1 text-body-sm font-medium text-danger empty:-mt-1.5 [&_svg]:mt-0.5 [&_svg]:size-4.5 [&_svg]:shrink-0',
)
