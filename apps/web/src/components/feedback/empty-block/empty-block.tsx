import { CategoryArt } from '@web/components/display/category-art'
import type { EmptyBlockProps } from '@web/components/feedback/empty-block/empty-block.types'
import {
  emptyBlockActionVariants,
  emptyBlockTitleVariants,
  emptyBlockVariants,
} from '@web/components/feedback/empty-block/empty-block.variants'

export function EmptyBlock({ icon, title, text, action }: EmptyBlockProps) {
  return (
    <div data-slot="empty-block" className={emptyBlockVariants()}>
      <CategoryArt name={title} icon={icon} size="empty" />
      <p className={emptyBlockTitleVariants()}>{title}</p>
      <p>{text}</p>
      {action && <div className={emptyBlockActionVariants()}>{action}</div>}
    </div>
  )
}
