import { cva } from 'class-variance-authority'

export const archivedToggleVariants = cva('flex w-full flex-col gap-2.5')

export const archivedToggleTriggerVariants = cva([
  'flex min-h-control w-full cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border-control px-3.5 text-label text-ink-muted outline-none',
  'hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring',
  '[&>[data-slot=chevron]]:ml-auto [&>[data-slot=chevron]]:size-4 [&>[data-slot=chevron]]:transition-transform [&>[data-slot=chevron]]:duration-normal',
  'data-panel-open:[&>[data-slot=chevron]]:rotate-180',
])
