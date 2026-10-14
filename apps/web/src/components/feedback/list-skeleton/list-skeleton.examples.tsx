import { ListSkeleton } from '@web/components/feedback/list-skeleton/list-skeleton'
import type { ComponentExamples } from '@web/lib/examples.types'

export const listSkeletonExamples: ComponentExamples = {
  component: 'ListSkeleton',
  examples: [
    { name: 'Três linhas', render: () => <ListSkeleton /> },
    { name: 'Duas linhas', render: () => <ListSkeleton rows={2} /> },
  ],
}
