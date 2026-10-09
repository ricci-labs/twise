import { cva } from 'class-variance-authority'

export const navLinkVariants = cva(
  'flex cursor-pointer items-center outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
  {
    variants: {
      layout: {
        sidebar:
          'min-h-11 gap-3 rounded-md px-3 text-body text-ink hover:bg-sunken aria-[current=page]:bg-mint-soft aria-[current=page]:font-semibold',
        icon: 'size-11 justify-center self-center rounded-md hover:bg-sunken aria-[current=page]:bg-mint-soft',
        tab: 'relative flex-col justify-start gap-1 pt-1.5 text-caption text-ink-muted aria-[current=page]:font-bold aria-[current=page]:text-ink',
      },
    },
    defaultVariants: { layout: 'sidebar' },
  },
)

export const navLinkMarkVariants = cva('absolute top-full mt-2.5 h-0.75 w-5.5 rounded-full bg-mint')
