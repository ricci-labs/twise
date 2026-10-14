import { cva } from 'class-variance-authority'

export const illustrationPickerVariants = cva('grid grid-cols-5 gap-2 lg:grid-cols-7')

export const illustrationTileVariants = cva([
  'grid aspect-square cursor-pointer place-items-center rounded-lg bg-sketch-paper p-1.75 text-sketch-ink outline-none',
  'focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
  'data-checked:inset-ring-2 data-checked:inset-ring-sketch-ink',
  'data-disabled:cursor-not-allowed data-disabled:opacity-70',
])

export const illustrationLetterVariants = cva('font-display text-form-title')
