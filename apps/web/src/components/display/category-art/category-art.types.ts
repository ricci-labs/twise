import type {
  categoryArtImageVariants,
  categoryArtVariants,
} from '@web/components/display/category-art/category-art.variants'
import type { VariantProps } from 'class-variance-authority'

export type CategoryArtProps = Omit<VariantProps<typeof categoryArtVariants>, 'hasArt'> & {
  name: string
  icon: string | null | undefined
  className?: string
}

export type CategoryArtVariant = NonNullable<CategoryArtProps['variant']>

export type CategoryDrawing = {
  src: string
  theme: NonNullable<VariantProps<typeof categoryArtImageVariants>['theme']>
}
