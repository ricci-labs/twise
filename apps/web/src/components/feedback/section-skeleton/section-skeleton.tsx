import { sectionSkeletonMessages as messages } from '@web/components/feedback/section-skeleton/section-skeleton.messages'
import type { SectionSkeletonProps } from '@web/components/feedback/section-skeleton/section-skeleton.types'
import {
  sectionSkeletonVariants,
  skeletonBlockVariants,
} from '@web/components/feedback/section-skeleton/section-skeleton.variants'
import { cn } from '@web/lib/cn'

export function SectionSkeleton({ lines = 3, hasChart = false, className }: SectionSkeletonProps) {
  return (
    <div
      data-slot="section-skeleton"
      role="status"
      aria-busy="true"
      className={cn(sectionSkeletonVariants(), className)}
    >
      <span className="sr-only">{messages.loading}</span>
      <span aria-hidden="true" className={skeletonBlockVariants({ shape: 'title' })} />
      {hasChart && (
        <span aria-hidden="true" className={skeletonBlockVariants({ shape: 'chart' })} />
      )}
      {lineShapes(lines).map(({ key, shape }) => (
        <span key={key} aria-hidden="true" className={skeletonBlockVariants({ shape })} />
      ))}
    </div>
  )
}

function lineShapes(lines: number) {
  return Array.from({ length: lines }, (_, line) => ({
    key: `line-${line}`,
    shape: line === lines - 1 ? ('short' as const) : ('line' as const),
  }))
}
