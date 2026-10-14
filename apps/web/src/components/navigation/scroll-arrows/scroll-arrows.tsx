import { scrollArrowsMessages as messages } from '@web/components/navigation/scroll-arrows/scroll-arrows.messages'
import type {
  ScrollArrowsProps,
  ScrollDirection,
} from '@web/components/navigation/scroll-arrows/scroll-arrows.types'
import {
  scrollArrowsVariants,
  scrollArrowVariants,
} from '@web/components/navigation/scroll-arrows/scroll-arrows.variants'
import { useScrollEnds } from '@web/hooks/use-scroll-ends'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const STEP_SHARE_OF_VIEW = 0.8

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

export function ScrollArrows({ scrollerRef, children }: ScrollArrowsProps) {
  const { hasBefore, hasAfter } = useScrollEnds(scrollerRef)

  function step(direction: ScrollDirection) {
    const scroller = scrollerRef.current
    if (!scroller) {
      return
    }
    const distance = scroller.clientWidth * STEP_SHARE_OF_VIEW
    scroller.scrollBy({
      left: direction === 'next' ? distance : -distance,
      behavior: window.matchMedia(REDUCED_MOTION).matches ? 'instant' : 'smooth',
    })
  }

  return (
    <div data-slot="scroll-arrows" className={scrollArrowsVariants()}>
      {children}
      {hasBefore && (
        <button
          type="button"
          aria-label={messages.previous}
          className={scrollArrowVariants({ direction: 'previous' })}
          onClick={() => step('previous')}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
      )}
      {hasAfter && (
        <button
          type="button"
          aria-label={messages.next}
          className={scrollArrowVariants({ direction: 'next' })}
          onClick={() => step('next')}
        >
          <ChevronRight aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
