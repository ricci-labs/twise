import { cva } from 'class-variance-authority'

export const yearStepperVariants = cva(
  'flex items-center justify-center gap-4 self-center rounded-full border border-border bg-surface p-1',
)

export const yearStepperStepVariants = cva(
  'grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-ink outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-not-allowed disabled:text-ink-subtle disabled:hover:bg-transparent [&>svg]:size-5',
)

export const yearStepperValueVariants = cva(
  'min-w-13 text-center font-display text-card-title font-bold tabular-nums',
)
