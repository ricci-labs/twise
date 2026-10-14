import { cva } from 'class-variance-authority'

export const categoryArtVariants = cva(
  'inline-grid shrink-0 place-items-center overflow-hidden font-bold text-sketch-ink',
  {
    variants: {
      variant: {
        loose: 'rounded-sm',
        onLight: 'rounded-sm',
      },
      size: {
        sm: 'size-8 text-caption',
        md: 'size-10.5 text-label',
        list: 'size-11 text-label',
        lg: 'size-11.5 text-label',
        xl: 'size-16 text-title',
        '2xl': 'size-22 text-title',
      },
      hasArt: {
        true: '',
        false: 'bg-sketch-paper',
      },
    },
    defaultVariants: { variant: 'loose', size: 'md', hasArt: true },
  },
)

export const categoryArtImageVariants = cva('size-full', {
  variants: {
    theme: {
      any: '',
      light: 'dark:hidden',
      dark: 'hidden dark:block',
    },
  },
  defaultVariants: { theme: 'any' },
})
