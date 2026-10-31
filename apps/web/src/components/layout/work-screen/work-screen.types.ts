import type { workScreenVariants } from '@web/components/layout/work-screen/work-screen.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

export type WorkScreenProps = VariantProps<typeof workScreenVariants> & {
  listLabel: string
  listHeader?: ReactNode
  list: ReactNode
  detailLabel: string
  detailHeader?: ReactNode
  detail: ReactNode
  onNearEnd?: () => void
}
