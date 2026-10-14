import { cva } from 'class-variance-authority'

export const pageFrameVariants = cva(
  'mx-auto flex w-full max-w-400 flex-col pb-6 lg:px-8 lg:pt-8 lg:pb-12',
  {
    variants: {
      edge: {
        inset: 'px-4 pt-2',
        bleed: '',
      },
    },
    defaultVariants: { edge: 'inset' },
  },
)
