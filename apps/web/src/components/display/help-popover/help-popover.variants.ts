import { cva } from 'class-variance-authority'

export const helpTriggerVariants = cva(
  'grid size-6 cursor-pointer place-items-center rounded-full opacity-80 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-focus-ring',
)

export const helpPopupVariants = cva(
  'z-overlay max-w-72 rounded-lg border border-border bg-surface px-4 py-3 text-body-sm text-ink shadow-dialog outline-none',
)
