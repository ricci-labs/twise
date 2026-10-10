import type { categoryArtVariants } from '@web/components/display/category-art/category-art.variants'
import type { VariantProps } from 'class-variance-authority'

export type CategoryArtProps = VariantProps<typeof categoryArtVariants> & {
  name: string
  icon: string | null | undefined
  className?: string
}
