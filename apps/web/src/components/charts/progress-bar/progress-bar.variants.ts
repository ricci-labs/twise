import { cva } from 'class-variance-authority'

export const progressBarVariants = cva('', {
  variants: {
    tone: {
      within: 'fill-mint',
      ahead: 'fill-chart-3',
      over: 'fill-danger',
      onMint: 'fill-on-mint',
    },
  },
  defaultVariants: { tone: 'within' },
})
