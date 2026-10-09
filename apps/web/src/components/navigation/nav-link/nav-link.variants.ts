import { cva } from 'class-variance-authority'

export const navLinkVariants = cva(
  'flex cursor-pointer items-center outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
  {
    variants: {
      layout: {
        sidebar:
          'min-h-11 gap-3 rounded-md px-3 text-body text-ink hover:not-aria-[current=page]:bg-page aria-[current=page]:bg-mint aria-[current=page]:font-emphasis aria-[current=page]:text-on-mint',
        icon: 'h-11 w-12 justify-center self-center rounded-md hover:not-aria-[current=page]:bg-page aria-[current=page]:bg-mint aria-[current=page]:text-on-mint',
        tab: 'flex-col justify-start gap-1 pt-1.5 text-caption text-ink-muted transition-colors duration-select aria-[current=page]:font-bold aria-[current=page]:text-mint-ink',
      },
    },
    defaultVariants: { layout: 'sidebar' },
  },
)
