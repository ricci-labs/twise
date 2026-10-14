import { cva } from 'class-variance-authority'

export const kpiSkeletonVariants = cva(
  'flex w-full flex-col gap-2.5 rounded-xl border border-border bg-surface px-4.5 py-4',
)

export const kpiSkeletonBlockVariants = cva('animate-pulse bg-sunken motion-reduce:animate-none', {
  variants: {
    shape: {
      label: 'h-3.5 w-2/5 rounded-sm',
      value: 'h-8.5 w-3/5 rounded-sm',
    },
  },
})
