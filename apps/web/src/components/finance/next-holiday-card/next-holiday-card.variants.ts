import { cva } from 'class-variance-authority'

export const nextHolidayCardVariants = cva(
  'flex h-full min-w-0 flex-col gap-3 rounded-lg border border-border bg-surface px-5.5 py-5 text-ink',
)

export const nextHolidayLabelVariants = cva(
  'text-note font-semibold tracking-wide text-ink-muted uppercase',
)

export const nextHolidayMainVariants = cva('flex min-w-0 items-center gap-4')

export const nextHolidayTextVariants = cva('flex min-w-0 flex-col gap-0.5')

export const nextHolidayNameVariants = cva(
  'line-clamp-2 font-display text-form-title-lg break-words',
)

export const nextHolidayWhenVariants = cva('text-body-sm text-ink-muted')

export const nextHolidayEffectVariants = cva(
  'mt-auto flex items-start gap-2 rounded-md bg-warning-soft px-3 py-2.5 text-body-sm font-medium text-ink [&>svg]:mt-0.5',
)

export const nextHolidayNoneVariants = cva('text-body-sm text-ink-muted')
