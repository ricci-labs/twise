import { cva } from 'class-variance-authority'

export const pairedCardGridVariants = cva(
  'flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-5',
)
