import type { WorkScreenProps } from '@web/components/layout/work-screen/work-screen.types'
import {
  workScreenBodyVariants,
  workScreenHeaderVariants,
  workScreenPaneVariants,
  workScreenVariants,
} from '@web/components/layout/work-screen/work-screen.variants'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { TALL_QUERY } from '@web/lib/breakpoints'
import { useEffect, useRef } from 'react'

const NEAR_END = '0px 0px 300px 0px'

export function WorkScreen({
  listLabel,
  listHeader,
  list,
  detailLabel,
  detailHeader,
  detail,
  onNearEnd,
  columns,
}: WorkScreenProps) {
  const isTall = useMediaQuery(TALL_QUERY)
  const listPane = useRef<HTMLElement>(null)
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = listPane.current
    const target = end.current
    if (!(isTall && onNearEnd && root && target)) {
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          onNearEnd()
        }
      },
      { root, rootMargin: NEAR_END },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [isTall, onNearEnd])

  return (
    <div
      data-slot="work-screen"
      data-tall={isTall ? '' : undefined}
      className={workScreenVariants({ columns })}
    >
      <section
        ref={listPane}
        aria-label={listLabel}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: a pane that scrolls on its own must take the keyboard focus so the arrow keys can scroll it
        tabIndex={0}
        className={workScreenPaneVariants({ side: 'list' })}
      >
        {listHeader && <div className={workScreenHeaderVariants()}>{listHeader}</div>}
        <div className={workScreenBodyVariants()}>
          {list}
          <div ref={end} data-slot="work-screen-end" aria-hidden="true" />
        </div>
      </section>
      <section
        aria-label={detailLabel}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: a pane that scrolls on its own must take the keyboard focus so the arrow keys can scroll it
        tabIndex={0}
        className={workScreenPaneVariants({ side: 'detail' })}
      >
        {detailHeader && <div className={workScreenHeaderVariants()}>{detailHeader}</div>}
        <div className={workScreenBodyVariants()}>{detail}</div>
      </section>
    </div>
  )
}
