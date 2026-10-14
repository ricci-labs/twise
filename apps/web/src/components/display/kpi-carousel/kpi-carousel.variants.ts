import { cva } from 'class-variance-authority'

export const kpiCarouselTrackVariants = cva(
  'flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto scroll-smooth px-4 pb-1 outline-none scrollbar-none focus-visible:ring-2 focus-visible:ring-focus-ring lg:grid lg:scroll-px-0 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0',
  {
    variants: {
      columns: {
        3: 'lg:grid-cols-3',
        4: 'lg:grid-cols-4',
      },
    },
    defaultVariants: { columns: 4 },
  },
)

export const kpiCarouselSlideVariants = cva('w-75 shrink-0 snap-start lg:w-auto')

export const kpiCarouselDotVariants = cva(
  'h-2 cursor-pointer rounded-full transition-all duration-raise ease-out',
  {
    variants: {
      isCurrent: { true: 'w-5.5 bg-ink', false: 'w-2 bg-indicator-idle' },
    },
    defaultVariants: { isCurrent: false },
  },
)
