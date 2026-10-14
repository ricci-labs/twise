import type { ReactNode, RefObject } from 'react'

export type ScrollDirection = 'previous' | 'next'

export type ScrollArrowsProps = {
  scrollerRef: RefObject<HTMLElement | null>
  children: ReactNode
}
