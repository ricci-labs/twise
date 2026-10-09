import type { TipProps } from '@web/components/feedback/tip/tip.types'
import { tipVariants } from '@web/components/feedback/tip/tip.variants'
import { cn } from '@web/lib/cn'
import { Eye, Info } from 'lucide-react'

export function Tip({ tone = 'plain', className, children }: TipProps) {
  const Icon = tone === 'readOnly' ? Eye : Info
  return (
    <p data-slot="tip" className={cn(tipVariants({ tone }), className)}>
      <Icon aria-hidden="true" />
      {children}
    </p>
  )
}
