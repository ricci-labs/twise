import { cva } from 'class-variance-authority'

export const nextDatesPreviewVariants = cva(
  'flex items-start gap-3 rounded-lg bg-sunken px-3.5 py-3 text-body-sm text-ink',
)

export const nextDatesBodyVariants = cva('flex min-w-0 flex-1 flex-col gap-2 pt-0.5')

export const nextDatesTitleVariants = cva('font-emphasis')

export const nextDatesListVariants = cva('flex flex-col')

export const nextDatesRowVariants = cva(
  'grid grid-cols-next-dates items-baseline gap-x-2.5 py-1.5 tabular-nums not-first:border-t not-first:border-border',
)

export const nextDatesDateVariants = cva('min-w-12 font-emphasis')

export const nextDatesWeekdayVariants = cva('text-ink-muted')

export const nextDatesAmountVariants = cva('font-emphasis whitespace-nowrap')

export const nextDatesNoteVariants = cva('col-start-2 col-end-4 text-note text-ink-muted')
