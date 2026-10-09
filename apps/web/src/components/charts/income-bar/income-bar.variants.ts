import { cva } from 'class-variance-authority'

export const incomeBarSegmentVariants = cva('', {
  variants: {
    tone: {
      spent: 'fill-chart-4',
      committed: 'fill-chart-3',
      free: 'fill-chart-2',
    },
  },
})

export const incomeBarDotVariants = cva('size-2.5 shrink-0 rounded-sm', {
  variants: {
    tone: {
      spent: 'bg-chart-4',
      committed: 'bg-chart-3',
      free: 'bg-chart-2',
    },
  },
})
