import { cva } from 'class-variance-authority'

export const twiseIconVariants = cva('shrink-0', {
  variants: {
    tone: {
      inherit: '',
      muted: 'text-ink-muted',
      accent: 'text-ink [&_[data-slot=icon-fill]]:fill-mint',
      danger: 'text-danger [&_[data-slot=icon-fill]]:fill-danger-soft',
      warning: 'text-warning [&_[data-slot=icon-fill]]:fill-warning-soft',
      info: 'text-info [&_[data-slot=icon-fill]]:fill-info-soft',
      success: 'text-success [&_[data-slot=icon-fill]]:fill-success-soft',
    },
    size: {
      sm: 'size-4',
      md: 'size-5',
      lg: 'size-6',
    },
  },
  defaultVariants: { tone: 'inherit', size: 'lg' },
})
