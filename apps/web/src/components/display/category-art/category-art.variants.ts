import { cva } from 'class-variance-authority'

export const categoryArtVariants = cva(
  'inline-grid shrink-0 place-items-center overflow-hidden text-sketch-ink',
  {
    variants: {
      variant: {
        loose: '',
        onLight: '',
      },
      size: {
        sm: 'size-8 text-caption font-bold',
        row: 'size-10 text-letter',
        md: 'size-10.5 text-letter',
        list: 'size-11 text-letter',
        lg: 'size-11.5 text-label font-bold',
        xl: 'size-16 text-title',
        '2xl': 'size-22 text-title',
        empty: 'size-24 text-title',
        fill: 'size-full text-title',
      },
      hasArt: {
        true: 'rounded-sm',
        false: 'rounded-md bg-sketch-paper font-display',
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
