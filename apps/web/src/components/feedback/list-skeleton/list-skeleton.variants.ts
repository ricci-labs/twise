import { cva } from 'class-variance-authority'

export const listSkeletonVariants = cva(
  'flex w-full flex-col rounded-lg border border-border bg-surface px-3 py-1',
)

export const listSkeletonRowVariants = cva(
  'flex min-h-16 items-center gap-3 border-border py-2.5 not-first:border-t',
)

export const listSkeletonTextVariants = cva('flex flex-1 flex-col gap-1.5')

export const listSkeletonBlockVariants = cva('animate-pulse bg-sunken motion-reduce:animate-none', {
  variants: {
    shape: {
      square: 'size-10.5 rounded-md',
      circle: 'size-10.5 rounded-full',
      name: 'h-3.5 w-1/2 rounded-sm',
      detail: 'h-3 w-7/10 rounded-sm',
      value: 'h-4 w-21 rounded-sm',
    },
  },
})
