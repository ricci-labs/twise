import { cva } from 'class-variance-authority'

export const colorPickerVariants = cva('flex flex-wrap gap-2.5')

export const colorOptionVariants = cva([
  'grid size-9 cursor-pointer place-items-center rounded-full outline-none',
  'focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
  'data-checked:outline-2 data-checked:outline-offset-3 data-checked:outline-ink data-checked:outline-solid',
  'data-disabled:cursor-not-allowed data-disabled:opacity-70',
])

export const colorNoneVariants = cva('size-9 rounded-full bg-surface text-border-control')
