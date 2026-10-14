import { autoFillTipMessages as messages } from '@web/components/feedback/auto-fill-tip/auto-fill-tip.messages'
import type { AutoFillTipProps } from '@web/components/feedback/auto-fill-tip/auto-fill-tip.types'
import {
  autoFillTipTextVariants,
  autoFillTipVariants,
  autoFillUndoVariants,
} from '@web/components/feedback/auto-fill-tip/auto-fill-tip.variants'
import { Check } from 'lucide-react'

export function AutoFillTip({ text, onUndo }: AutoFillTipProps) {
  return (
    <p data-slot="auto-fill-tip" role="status" className={autoFillTipVariants()}>
      <Check aria-hidden="true" />
      <span className={autoFillTipTextVariants()}>{text}</span>
      <button type="button" onClick={onUndo} className={autoFillUndoVariants()}>
        {messages.undo}
      </button>
    </p>
  )
}
