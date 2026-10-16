import { cva } from 'class-variance-authority'

export const progressBarVariants = cva('', {
  variants: {
    tone: {
      within: 'fill-mint',
      ahead: 'fill-warning-fill',
      over: 'fill-danger',
      onMint: 'fill-on-mint',
      goal: 'fill-chart-4',
      reserve: 'fill-mint',
      strong: 'fill-mint-ink',
      muted: 'fill-ink-subtle',
    },
  },
  defaultVariants: { tone: 'within' },
})

export const progressTrackVariants = cva('', {
  variants: {
    tone: {
      within: 'fill-sunken',
      ahead: 'fill-sunken',
      over: 'fill-sunken',
      onMint: 'fill-on-mint/15',
      goal: 'fill-sunken',
      reserve: 'fill-surface/70',
      strong: 'fill-sunken',
      muted: 'fill-sunken',
    },
  },
  defaultVariants: { tone: 'within' },
})

export const progressSvgVariants = cva('w-full overflow-visible', {
  variants: {
    thickness: {
      md: 'h-4',
      lg: 'h-2.5',
    },
  },
  defaultVariants: { thickness: 'md' },
})
