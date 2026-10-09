import { cva } from 'class-variance-authority'

export const sectionSkeletonVariants = cva(
  'flex flex-col gap-3 rounded-lg border border-border bg-surface p-4',
)

export const skeletonBlockVariants = cva(
  'animate-pulse rounded-sm bg-sunken motion-reduce:animate-none',
  {
    variants: {
      shape: {
        title: 'h-5 w-2/5',
        line: 'h-3.5 w-full',
        short: 'h-3.5 w-3/5',
        chart: 'h-36 w-full',
      },
    },
    defaultVariants: { shape: 'line' },
  },
)
