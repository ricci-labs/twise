import { cva } from 'class-variance-authority'

export const metaLinePieceVariants = cva('', {
  variants: {
    fits: {
      true: 'whitespace-nowrap',
      false: '',
    },
  },
  defaultVariants: {
    fits: true,
  },
})

export const metaLineHiddenDotVariants = cva('sr-only')
