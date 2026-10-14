import type { kpiCarouselTrackVariants } from '@web/components/display/kpi-carousel/kpi-carousel.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

export type KpiCarouselProps = VariantProps<typeof kpiCarouselTrackVariants> & {
  children: readonly ReactNode[]
  className?: string
}
