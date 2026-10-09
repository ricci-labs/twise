import { SectionSkeleton } from '@web/components/feedback/section-skeleton/section-skeleton'
import type { ComponentExamples } from '@web/lib/examples.types'

export const sectionSkeletonExamples: ComponentExamples = {
  component: 'SectionSkeleton',
  examples: [
    { name: 'Lista', render: () => <SectionSkeleton /> },
    { name: 'Gráfico', render: () => <SectionSkeleton hasChart lines={1} /> },
  ],
}
