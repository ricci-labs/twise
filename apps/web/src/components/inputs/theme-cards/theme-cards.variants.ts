import { cva } from 'class-variance-authority'

export const themeCardsVariants = cva('grid grid-cols-3 gap-2', {
  variants: {
    size: {
      compact: '',
      fill: 'flex-1',
    },
  },
  defaultVariants: { size: 'compact' },
})

export const themeCardVariants = cva([
  'flex cursor-pointer flex-col gap-2 rounded-lg border border-border-control bg-surface p-2.5 text-left text-ink outline-none',
  'focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
  'data-checked:border-ink data-checked:ring-1 data-checked:ring-ink data-checked:ring-inset',
])

export const themeMiniatureVariants = cva(
  'flex flex-col gap-1.5 overflow-hidden rounded-md px-2.5',
  {
    variants: {
      size: {
        compact: 'h-14 justify-center',
        fill: 'min-h-14 flex-1 justify-start pt-2.5',
      },
      choice: {
        light: 'bg-sunken',
        dark: 'bg-ink',
        system: 'bg-linear-to-r from-sunken from-50% to-ink to-50%',
      },
    },
    defaultVariants: { size: 'compact' },
  },
)

export const themeMiniatureBarVariants = cva('h-1.5 rounded-full', {
  variants: {
    tone: {
      mint: 'w-3/5 bg-mint',
      line: 'w-4/5 bg-border-control',
      short: 'w-2/5 bg-border-control',
    },
  },
})

export const themeCardTitleVariants = cva('text-label font-semibold')

export const themeCardDetailVariants = cva('min-h-4.5 text-note text-ink-muted')
