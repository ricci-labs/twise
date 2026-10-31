import type {
  resultStateArtVariants,
  resultStateVariants,
} from '@web/components/feedback/result-state/result-state.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

export type ResultStateProps = VariantProps<typeof resultStateVariants> &
  VariantProps<typeof resultStateArtVariants> & {
    art: ReactNode
    title: string
    text: string
    detail?: string
    action?: ReactNode
    isAlert?: boolean
  }
