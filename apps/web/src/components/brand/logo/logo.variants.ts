import { cva } from 'class-variance-authority'

export const logoVariants = cva('block select-none', {
  variants: {
    variant: {
      full: 'h-7 w-auto',
      icon: 'size-10.5',
      mark: 'size-7.5',
      lockup: 'flex items-center gap-2.5',
    },
  },
  defaultVariants: { variant: 'full' },
})

export const logoLockupIconVariants = cva('size-10.5 shrink-0')

export const logoWordmarkVariants = cva('font-display text-wordmark text-ink')
