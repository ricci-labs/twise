import { attachAreaMessages as messages } from '@web/components/finance/attach-area/attach-area.messages'
import type { AttachAreaProps } from '@web/components/finance/attach-area/attach-area.types'
import {
  attachAreaHintVariants,
  attachAreaTitleVariants,
  attachAreaVariants,
} from '@web/components/finance/attach-area/attach-area.variants'
import { Upload } from 'lucide-react'

export function AttachArea({
  title = messages.title,
  hint = messages.hint,
  onPress,
}: AttachAreaProps) {
  return (
    <button
      type="button"
      data-slot="attach-area"
      className={attachAreaVariants()}
      onClick={onPress}
    >
      <Upload aria-hidden="true" />
      <span>
        <span className={attachAreaTitleVariants()}>{title}</span>
        <span className={attachAreaHintVariants()}>{hint}</span>
      </span>
    </button>
  )
}
