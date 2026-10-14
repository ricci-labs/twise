import { type RefObject, useEffect, useState } from 'react'

const EDGE_TOLERANCE_PX = 1

const NOTHING_HIDDEN = { hasBefore: false, hasAfter: false }

export function useScrollEnds(scrollerRef: RefObject<HTMLElement | null>) {
  const [ends, setEnds] = useState(NOTHING_HIDDEN)

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) {
      return
    }
    const update = () => setEnds((shown) => keepIfSame(shown, measureEnds(scroller)))
    const resizes = new ResizeObserver(update)
    const observeChildren = () => {
      for (const child of scroller.children) {
        resizes.observe(child)
      }
      update()
    }
    const mutations = new MutationObserver(observeChildren)
    resizes.observe(scroller)
    mutations.observe(scroller, { childList: true })
    observeChildren()
    scroller.addEventListener('scroll', update, { passive: true })
    return () => {
      scroller.removeEventListener('scroll', update)
      mutations.disconnect()
      resizes.disconnect()
    }
  }, [scrollerRef])

  return ends
}

function measureEnds(scroller: HTMLElement) {
  return {
    hasBefore: scroller.scrollLeft > EDGE_TOLERANCE_PX,
    hasAfter: scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - EDGE_TOLERANCE_PX,
  }
}

function keepIfSame(shown: typeof NOTHING_HIDDEN, measured: typeof NOTHING_HIDDEN) {
  return shown.hasBefore === measured.hasBefore && shown.hasAfter === measured.hasAfter
    ? shown
    : measured
}
