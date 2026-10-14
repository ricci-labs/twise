import { cva } from 'class-variance-authority'

export const switchRowVariants = cva(
  'flex min-h-control items-center gap-3 text-choice text-ink lg:justify-start lg:gap-4',
)

export const switchLabelVariants = cva('flex-1 lg:flex-none')

export const switchVariants = cva([
  'relative h-8 w-13 shrink-0 cursor-pointer rounded-full bg-border-control p-1 outline-none transition-colors duration-fast',
  'focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
  'data-checked:bg-mint-ink data-disabled:cursor-not-allowed data-disabled:opacity-60',
])

export const switchThumbVariants = cva(
  'block size-6 rounded-full bg-surface shadow-raised transition-transform duration-fast data-checked:translate-x-5',
)
