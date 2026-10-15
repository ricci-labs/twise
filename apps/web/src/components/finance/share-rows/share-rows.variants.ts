import { cva } from 'class-variance-authority'

export const shareRowsVariants = cva('m-0 flex list-none flex-col gap-2.5 p-0')

export const shareRowVariants = cva('flex items-center gap-2 text-body-sm font-medium', {
  variants: {
    isOwn: {
      true: 'border-t border-border pt-2.5 font-emphasis',
      false: '',
    },
  },
  defaultVariants: { isOwn: false },
})

export const shareNameVariants = cva('inline-flex items-center gap-1.5')

export const shareLeaderVariants = cva('mt-1 min-w-4 flex-1 self-center dotted-leader')

export const shareAmountVariants = cva('font-emphasis tabular-nums')

export const shareNoteVariants = cva('mt-2.5 text-note text-ink-muted')
