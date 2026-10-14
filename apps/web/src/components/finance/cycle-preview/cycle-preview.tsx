import { CategoryArt } from '@web/components/display/category-art'
import { RichText } from '@web/components/display/rich-text'
import type { CyclePreviewProps } from '@web/components/finance/cycle-preview/cycle-preview.types'
import {
  cyclePreviewTextVariants,
  cyclePreviewVariants,
} from '@web/components/finance/cycle-preview/cycle-preview.variants'

export function CyclePreview({ text }: CyclePreviewProps) {
  return (
    <div data-slot="cycle-preview" aria-live="polite" className={cyclePreviewVariants()}>
      <CategoryArt name="" icon="calendar" size="lg" />
      <p className={cyclePreviewTextVariants()}>
        <RichText text={text} />
      </p>
    </div>
  )
}
