import { cva } from 'class-variance-authority'

export const kpiCarouselTrackVariants = cva(
  'flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-1 scrollbar-none lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0',
)

export const kpiCarouselSlideVariants = cva('w-75 shrink-0 snap-start lg:w-auto')

export const kpiCarouselDotVariants = cva(
  'h-2 cursor-pointer rounded-full transition-all duration-fast',
  {
    variants: {
      isCurrent: { true: 'w-5 bg-ink', false: 'w-2 bg-border' },
    },
    defaultVariants: { isCurrent: false },
  },
)
