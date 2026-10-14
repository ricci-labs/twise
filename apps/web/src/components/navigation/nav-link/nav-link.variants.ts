import { cva } from 'class-variance-authority'

export const navLinkVariants = cva(
  'flex cursor-pointer items-center outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
  {
    variants: {
      layout: {
        sidebar:
          'min-h-10.5 gap-3 rounded-md px-3 text-choice text-ink hover:not-aria-[current=page]:bg-page aria-[current=page]:bg-mint aria-[current=page]:font-emphasis aria-[current=page]:text-on-mint',
        icon: 'h-11 w-12 justify-center self-center rounded-md hover:not-aria-[current=page]:bg-page aria-[current=page]:bg-mint aria-[current=page]:text-on-mint',
        tab: 'flex-col justify-center gap-0.75 rounded-md text-tab text-ink-muted transition-colors duration-select aria-[current=page]:font-bold aria-[current=page]:text-mint-ink',
      },
    },
    defaultVariants: { layout: 'sidebar' },
  },
)

export const navLinkLabelVariants = cva('', {
  variants: {
    layout: {
      sidebar: 'transition-opacity duration-fast ease-out group-data-fading/sidebar:opacity-0',
      icon: '',
      tab: '',
    },
  },
  defaultVariants: { layout: 'sidebar' },
})

export const navLinkIconVariants = cva('', {
  variants: {
    layout: {
      sidebar: 'contents',
      icon: 'contents',
      tab: 'grid h-7.5 w-11 place-items-center',
    },
  },
  defaultVariants: { layout: 'sidebar' },
})
