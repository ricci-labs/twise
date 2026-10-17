import { listSkeletonMessages as messages } from '@web/components/feedback/list-skeleton/list-skeleton.messages'
import type { ListSkeletonProps } from '@web/components/feedback/list-skeleton/list-skeleton.types'
import {
  listSkeletonBlockVariants,
  listSkeletonRowVariants,
  listSkeletonTextVariants,
  listSkeletonVariants,
} from '@web/components/feedback/list-skeleton/list-skeleton.variants'

const DEFAULT_ROWS = 3

export function ListSkeleton({ rows = DEFAULT_ROWS, art = 'square' }: ListSkeletonProps) {
  return (
    <div
      data-slot="list-skeleton"
      role="status"
      aria-busy="true"
      className={listSkeletonVariants()}
    >
      {Array.from({ length: rows }, (_, row) => `row-${row}`).map((key) => (
        <div key={key} aria-hidden="true" className={listSkeletonRowVariants()}>
          <span className={listSkeletonBlockVariants({ shape: art })} />
          <span className={listSkeletonTextVariants()}>
            <span className={listSkeletonBlockVariants({ shape: 'name' })} />
            <span className={listSkeletonBlockVariants({ shape: 'detail' })} />
          </span>
          <span className={listSkeletonBlockVariants({ shape: 'value' })} />
        </div>
      ))}
      <span className="sr-only">{messages.loading}</span>
    </div>
  )
}
