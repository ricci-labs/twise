import { cva } from 'class-variance-authority'

export const holidayRowVariants = cva(
  'flex min-h-16 items-center gap-3 border-border py-2.5 not-first:border-t',
)

export const holidayRowTextVariants = cva('flex min-w-0 flex-1 flex-col gap-0.5')

export const holidayRowNameVariants = cva('line-clamp-2 text-row font-semibold break-words', {
  variants: {
    isPast: {
      true: 'text-ink-subtle',
      false: 'text-ink',
    },
  },
  defaultVariants: { isPast: false },
})

export const holidayRowDetailVariants = cva(
  'line-clamp-2 text-row-detail break-words text-ink-muted [&>[data-slot=badge]]:me-1.5 [&>[data-slot=badge]]:align-text-bottom',
)

export const holidayRowActionsVariants = cva('-mr-2 shrink-0')
