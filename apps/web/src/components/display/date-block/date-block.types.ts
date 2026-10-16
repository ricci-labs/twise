import type { IsoDate } from '@financas/shared'
import type { dateBlockVariants } from '@web/components/display/date-block/date-block.variants'
import type { VariantProps } from 'class-variance-authority'

export type DateBlockTone = NonNullable<VariantProps<typeof dateBlockVariants>['tone']>

export type DateBlockProps = {
  date: IsoDate
  tone?: DateBlockTone
  digits?: 'plain' | 'padded'
}
