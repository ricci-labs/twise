import { cva } from 'class-variance-authority'

export const tileGridVariants = cva(
  'flex flex-col lg:flex-row lg:flex-wrap lg:*:min-w-80 lg:*:grow lg:*:basis-1/5 lg:has-[>:nth-child(4n+1):last-child:not(:first-child)]:*:basis-1/4',
  {
    variants: {
      density: {
        compact: 'gap-2.5 lg:gap-4',
        comfortable: 'gap-4 lg:gap-5',
      },
    },
    defaultVariants: { density: 'comfortable' },
  },
)
