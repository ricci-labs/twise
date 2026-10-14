import { Amount } from '@web/components/display/amount'
import { Avatar } from '@web/components/display/avatar'
import { sharesListMessages as messages } from '@web/components/finance/shares-list/shares-list.messages'
import type {
  SharesCollapsedProps,
  SharesListProps,
} from '@web/components/finance/shares-list/shares-list.types'
import {
  shareAmountVariants,
  shareGapVariants,
  shareLeaderVariants,
  shareNameVariants,
  shareRemoveVariants,
  shareRowVariants,
  sharesAddVariants,
  sharesCollapsedVariants,
  sharesErrorVariants,
  sharesHeadVariants,
  sharesListVariants,
  sharesQuickFillsVariants,
  sharesQuickFillVariants,
  sharesTitleVariants,
  sharesVariants,
  shareYoursValueVariants,
} from '@web/components/finance/shares-list/shares-list.variants'
import { MoneyInput } from '@web/components/inputs/money-input'
import { CircleAlert, Plus, X } from 'lucide-react'
import { useId } from 'react'

export function SharesCollapsed({ ref, onOpen }: SharesCollapsedProps) {
  return (
    <button ref={ref} type="button" onClick={onOpen} className={sharesCollapsedVariants()}>
      <Plus aria-hidden="true" />
      {messages.title}
    </button>
  )
}

export function SharesList({
  rows,
  yoursName,
  yoursCents,
  error,
  canAdd,
  addRef,
  onAmountChange,
  onAmountBlur,
  onRemove,
  onAdd,
  onHalf,
  onEqually,
}: SharesListProps) {
  const titleId = useId()
  return (
    <section data-slot="shares-list" aria-labelledby={titleId} className={sharesVariants()}>
      <div className={sharesHeadVariants()}>
        <h3 id={titleId} className={sharesTitleVariants()}>
          {messages.title}
        </h3>
        <span className={sharesQuickFillsVariants()}>
          <button type="button" onClick={onHalf} className={sharesQuickFillVariants()}>
            {messages.half}
          </button>
          <button type="button" onClick={onEqually} className={sharesQuickFillVariants()}>
            {messages.equally}
          </button>
        </span>
      </div>
      <ul className={sharesListVariants()}>
        {rows.map((row) => (
          <li key={row.key} className={shareRowVariants()}>
            <Avatar name={row.contactName} tone="paper" size="sm" />
            <span className={shareNameVariants()}>{row.contactName}</span>
            <span aria-hidden="true" className={shareLeaderVariants()} />
            <MoneyInput
              size="sm"
              className={shareAmountVariants()}
              aria-label={messages.amountOf(row.contactName)}
              aria-invalid={row.isInvalid ? true : undefined}
              value={row.amountText}
              onChange={(change) => onAmountChange(row.key, change)}
              onBlur={() => onAmountBlur?.(row.key)}
            />
            <button
              type="button"
              aria-label={messages.remove(row.contactName)}
              onClick={() => onRemove(row.key)}
              className={shareRemoveVariants()}
            >
              <X aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <p aria-live="polite" className={sharesErrorVariants()}>
        {error && (
          <>
            <CircleAlert aria-hidden="true" />
            {error}
          </>
        )}
      </p>
      <button
        ref={addRef}
        type="button"
        onClick={onAdd}
        disabled={!canAdd}
        className={sharesAddVariants()}
      >
        <Plus aria-hidden="true" />
        {messages.add}
      </button>
      <div className={shareRowVariants({ isYours: true })}>
        <Avatar name={yoursName} size="sm" />
        <span className={shareNameVariants({ isYours: true })}>{messages.yours}</span>
        <span aria-hidden="true" className={shareLeaderVariants()} />
        <span className={shareYoursValueVariants()}>
          {yoursCents === null ? messages.blank : <Amount cents={yoursCents} size="inherit" />}
        </span>
        <span aria-hidden="true" className={shareGapVariants()} />
      </div>
    </section>
  )
}
