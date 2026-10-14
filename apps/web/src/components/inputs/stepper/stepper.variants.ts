import { cva } from 'class-variance-authority'

export const stepperRowVariants = cva('flex flex-wrap items-center gap-3.5')

export const stepperVariants = cva(
  'inline-flex items-center overflow-hidden rounded-full border border-border-control bg-surface',
)

export const stepperButtonVariants = cva([
  'grid h-11.5 w-11 cursor-pointer place-items-center text-title text-ink outline-none',
  'hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-inset',
  'disabled:cursor-not-allowed disabled:text-ink-subtle disabled:hover:bg-surface',
])

export const stepperValueVariants = cva('min-w-19 text-center text-title-sm font-bold tabular-nums')

export const stepperAsideVariants = cva(
  'text-body-sm text-ink-muted [&_strong]:font-emphasis [&_strong]:text-ink [&_strong]:tabular-nums',
)
