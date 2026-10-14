import type { PageFrameProps } from '@web/components/layout/page-frame/page-frame.types'
import { pageFrameVariants } from '@web/components/layout/page-frame/page-frame.variants'
import { cn } from '@web/lib/cn'

export function PageFrame({ edge, className, ...props }: PageFrameProps) {
  return (
    <div data-slot="page-frame" className={cn(pageFrameVariants({ edge }), className)} {...props} />
  )
}
