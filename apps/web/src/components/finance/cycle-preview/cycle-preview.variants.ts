import { cva } from 'class-variance-authority'

export const cyclePreviewVariants = cva(
  'flex items-start gap-3 rounded-lg bg-sunken px-3.5 py-3 [&>[data-slot=category-art]]:-m-0.75',
)

export const cyclePreviewTextVariants = cva('flex-1 pt-0.5 text-label font-normal text-ink')
