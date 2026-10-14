import { cva } from 'class-variance-authority'

export const subcategoryAddChipVariants = cva([
  'inline-flex h-7.5 items-center rounded-full border-stroke border-dashed border-border-control px-2.5 text-ink-muted outline-none',
  'hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 [&_svg]:size-3.75',
])
