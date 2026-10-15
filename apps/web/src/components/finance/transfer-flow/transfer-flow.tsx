import { CategoryArt } from '@web/components/display/category-art'
import { transferFlowMessages as messages } from '@web/components/finance/transfer-flow/transfer-flow.messages'
import type {
  TransferBoxProps,
  TransferFlowProps,
} from '@web/components/finance/transfer-flow/transfer-flow.types'
import {
  transferBoxVariants,
  transferFlowVariants,
  transferLabelVariants,
  transferNameVariants,
  transferNoteVariants,
} from '@web/components/finance/transfer-flow/transfer-flow.variants'
import { ArrowRight } from 'lucide-react'

export function TransferFlow({
  from,
  to,
  fromLabel = messages.from,
  toLabel = messages.to,
  note,
}: TransferFlowProps) {
  return (
    <>
      <div data-slot="transfer-flow" className={transferFlowVariants()}>
        <TransferBox end={from} label={fromLabel} />
        <ArrowRight aria-hidden="true" />
        <TransferBox end={to} label={toLabel} />
      </div>
      {note && <p className={transferNoteVariants()}>{note}</p>}
    </>
  )
}

function TransferBox({ end, label }: TransferBoxProps) {
  return (
    <p className={transferBoxVariants()}>
      <CategoryArt name={end.name} icon={end.icon} size="sm" />
      <span className={transferLabelVariants()}>{label}</span>
      <span className={transferNameVariants()}>{end.name}</span>
    </p>
  )
}
