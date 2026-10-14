import type { pageFrameVariants } from '@web/components/layout/page-frame/page-frame.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

export type PageFrameProps = ComponentProps<'div'> & VariantProps<typeof pageFrameVariants>
