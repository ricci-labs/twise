import { kpiCarouselMessages as messages } from '@web/components/display/kpi-carousel/kpi-carousel.messages'
import type { KpiCarouselProps } from '@web/components/display/kpi-carousel/kpi-carousel.types'
import {
  kpiCarouselDotVariants,
  kpiCarouselSlideVariants,
  kpiCarouselTrackVariants,
} from '@web/components/display/kpi-carousel/kpi-carousel.variants'
import { cn } from '@web/lib/cn'
import { Children, isValidElement, useId, useRef, useState } from 'react'

export function KpiCarousel({ children, className }: KpiCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const total = children.length
  const titleId = useId()

  function slides(): HTMLElement[] {
    return [...(trackRef.current?.children ?? [])] as HTMLElement[]
  }

  function onScroll() {
    const track = trackRef.current
    if (!track) {
      return
    }
    const nearest = slides().reduce(
      (best, slide, position) => {
        const distance = Math.abs(slide.offsetLeft - track.offsetLeft - track.scrollLeft)
        return distance < best.distance ? { position, distance } : best
      },
      { position: 0, distance: Number.POSITIVE_INFINITY },
    )
    setCurrent(nearest.position)
  }

  function goTo(position: number) {
    slides()[position]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
  }

  return (
    <section
      data-slot="kpi-carousel"
      aria-labelledby={titleId}
      className={cn('flex flex-col gap-3', className)}
    >
      <h2 id={titleId} className="sr-only">
        {messages.label}
      </h2>
      <div ref={trackRef} className={kpiCarouselTrackVariants()} onScroll={onScroll}>
        {Children.toArray(children).map((child, position) => (
          // biome-ignore lint/a11y/useSemanticElements: the WAI-ARIA carousel names each slide as a group
          <div
            key={isValidElement(child) ? child.key : String(child)}
            role="group"
            aria-roledescription="slide"
            aria-label={messages.slide(position + 1, total)}
            className={kpiCarouselSlideVariants()}
          >
            {child}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-1.5 lg:hidden">
        {slideNumbers(total).map((position) => (
          <button
            key={position}
            type="button"
            aria-label={messages.goTo(position + 1)}
            aria-current={position === current ? true : undefined}
            className={kpiCarouselDotVariants({ isCurrent: position === current })}
            onClick={() => goTo(position)}
          />
        ))}
      </div>
    </section>
  )
}

function slideNumbers(total: number): number[] {
  return Array.from({ length: total }, (_, position) => position)
}
