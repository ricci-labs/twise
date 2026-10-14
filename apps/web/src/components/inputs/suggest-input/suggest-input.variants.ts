import { cva } from 'class-variance-authority'

export const suggestPositionerVariants = cva('z-modal')

export const suggestPopupVariants = cva(
  'w-anchor rounded-md border border-border bg-surface p-1.5 shadow-dialog outline-none',
)

export const suggestItemVariants = cva(
  'cursor-pointer rounded-sm px-3 py-2.5 text-choice font-normal text-ink-muted outline-none select-none data-highlighted:bg-sunken data-highlighted:text-ink [&_b]:font-emphasis [&_b]:text-ink',
)
