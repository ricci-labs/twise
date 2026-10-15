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

export const shareNameVariants = cva('inline-flex min-w-0 items-center gap-1.5')

export const shareNameTextVariants = cva('line-clamp-2 min-w-0 break-words')

export const shareLeaderVariants = cva('mt-1 min-w-4 flex-1 self-center dotted-leader')

export const shareAmountVariants = cva('shrink-0 font-emphasis tabular-nums')

export const shareNoteVariants = cva('mt-2.5 text-note text-ink-muted')
