import type { verdictVariants } from '@web/components/display/verdict/verdict.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

export type VerdictTone = NonNullable<VariantProps<typeof verdictVariants>['tone']>

export type VerdictProps = {
  tone: VerdictTone
  title: string
  text: ReactNode
}
