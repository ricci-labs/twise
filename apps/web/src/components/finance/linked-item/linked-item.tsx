import type { LinkedItemProps } from '@web/components/finance/linked-item/linked-item.types'
import {
  linkedItemTextVariants,
  linkedItemVariants,
} from '@web/components/finance/linked-item/linked-item.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { ChevronRight } from 'lucide-react'
import { cloneElement } from 'react'

export function LinkedItem({ icon, label, link, tone }: LinkedItemProps) {
  return cloneElement(
    link,
    { className: linkedItemVariants({ tone }) },
    <>
      <TwiseIcon name={icon} size="sm" />
      <span className={linkedItemTextVariants()}>{label}</span>
      <ChevronRight aria-hidden="true" />
    </>,
  )
}
