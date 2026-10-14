import { cva } from 'class-variance-authority'

export const categoryRowVariants = cva('border-border not-first:border-t')

export const categoryRowLineVariants = cva('flex min-h-16 items-center gap-1.5')

export const categoryRowMainVariants = cva(
  'flex min-w-0 flex-1 items-center gap-3 py-2.5 text-ink [&>[data-slot=category-art]]:-my-0.5 [&>[data-slot=category-art]]:-ml-0.5 [&>[data-slot=category-art]]:mr-0.5',
)

export const categoryRowNameVariants = cva('flex min-w-0 items-center gap-2 text-row')

export const categoryRowDetailVariants = cva('text-note text-ink-muted')

export const categoryRowToggleVariants = cva([
  'inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-1 rounded-full bg-sunken px-2.5 text-toggle text-ink-muted outline-none',
  'focus-visible:ring-2 focus-visible:ring-focus-ring',
  'data-panel-open:bg-mint-soft data-panel-open:text-mint-ink',
  '[&_svg]:size-3.75 [&_svg]:transition-transform [&_svg]:duration-select data-panel-open:[&_svg]:rotate-180',
])

export const categoryRowChipsVariants = cva('flex flex-wrap gap-1.5 pb-3.5 pl-14')

export const categoryRowActionsVariants = cva('-mr-2 shrink-0')
