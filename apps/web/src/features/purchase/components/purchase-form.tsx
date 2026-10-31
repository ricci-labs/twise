import {
  formatBrl,
  type IsoDate,
  installmentPlan,
  MONEY_ACCOUNT_KINDS,
  parseIsoDate,
} from '@financas/shared'
import { SegmentedControl } from '@web/components/actions/segmented-control'
import { CategoryArt } from '@web/components/display/category-art'
import { InvoicePreview } from '@web/components/finance/invoice-preview'
import { FieldGroup } from '@web/components/forms/field-group'
import { DateInput } from '@web/components/inputs/date-input'
import { MoneyInput } from '@web/components/inputs/money-input'
import { PickerField } from '@web/components/inputs/picker-field'
import { type PickerItem, PickerSheet } from '@web/components/inputs/picker-sheet'
import { Stepper } from '@web/components/inputs/stepper'
import { maxInstallmentsOf } from '@web/features/purchase/components/purchase-views'
import { purchaseMessages as messages } from '@web/features/purchase/purchase.messages'
import type {
  PaymentChoice,
  PurchaseCard,
  PurchaseFormProps,
  PurchasePickerProps,
  PurchasePlanProps,
} from '@web/features/purchase/purchase.types'
import { formatShortDate, formatShortDateWithYear } from '@web/lib/format/calendar'
import { centsOfTypedAmount } from '@web/lib/format/money'
import { useRef, useState } from 'react'

const fields = messages.fields
const SHOWN_ROWS = 3
const CARD_ICON = 'card'
const MONEY_KINDS: readonly string[] = MONEY_ACCOUNT_KINDS

export function PurchaseForm(props: PurchaseFormProps) {
  const { draft, today, onChange } = props
  return (
    <div className="flex flex-col gap-5">
      <FieldGroup label={fields.amount} isRequired>
        <MoneyInput
          size="lg"
          aria-label={fields.amount}
          value={draft.amount}
          onChange={(event) => onChange({ amount: event.target.value })}
        />
      </FieldGroup>
      <FieldGroup label={fields.payment} isRequired>
        <SegmentedControl
          label={fields.payment}
          width="full"
          selection="outline"
          value={draft.payment}
          onValueChange={(payment) => onChange({ payment: payment as PaymentChoice })}
          options={[
            { value: 'card', label: messages.payments.card },
            { value: 'account', label: messages.payments.account },
          ]}
        />
      </FieldGroup>
      {draft.payment === 'card' ? <CardFields {...props} /> : <AccountFields {...props} />}
      <FieldGroup label={fields.date}>
        <DateInput
          title={fields.date}
          today={today}
          value={draft.occurredOn}
          onChange={(event) => onChange({ occurredOn: event.target.value as IsoDate })}
        />
      </FieldGroup>
    </div>
  )
}

function CardFields({ draft, cards, today, onChange }: PurchaseFormProps) {
  const amountCents = centsOfTypedAmount(draft.amount)
  const card = cards.find((candidate) => candidate.accountId === draft.cardAccountId)
  const items = cards
    .filter((candidate) => candidate.archivedAt === null)
    .map((candidate) => ({
      value: candidate.accountId,
      label: candidate.name,
      icon: candidate.icon ?? CARD_ICON,
      detail: cardDetailOf(candidate),
    }))
  const eachCents = amountCents ? Math.floor(amountCents / draft.installmentCount) : null
  return (
    <>
      <PurchasePicker
        label={fields.card}
        placeholder={messages.cards.placeholder}
        items={items}
        value={draft.cardAccountId}
        empty={{ icon: CARD_ICON, ...messages.cards.empty }}
        onSelect={(cardAccountId) => onChange({ cardAccountId })}
      />
      <FieldGroup label={fields.installments} isRequired>
        <Stepper
          value={draft.installmentCount}
          min={1}
          max={maxInstallmentsOf(amountCents)}
          onChange={(installmentCount) => onChange({ installmentCount })}
          valueText={
            draft.installmentCount === 1
              ? messages.installments.cash
              : messages.installments.times(draft.installmentCount)
          }
          decreaseLabel={messages.installments.fewer}
          increaseLabel={messages.installments.more}
          aside={
            eachCents && draft.installmentCount > 1
              ? messages.installments.each(draft.installmentCount, formatBrl(eachCents))
              : undefined
          }
        />
      </FieldGroup>
      {card && amountCents && amountCents >= draft.installmentCount && (
        <PurchasePlan
          card={card}
          totalCents={amountCents}
          count={draft.installmentCount}
          purchaseDate={draft.occurredOn}
          today={today}
        />
      )}
    </>
  )
}

function AccountFields({ draft, accounts, balances, onChange }: PurchaseFormProps) {
  const items = accounts
    .filter(
      (account) =>
        MONEY_KINDS.includes(account.kind) && !account.isSystem && account.archivedAt === null,
    )
    .map((account) => {
      const balance = balances.find((item) => item.accountId === account.id)
      return {
        value: account.id,
        label: account.name,
        icon: account.icon,
        detail: balance
          ? messages.accounts.balance(formatBrl(balance.naturalBalanceCents))
          : undefined,
      }
    })
  return (
    <PurchasePicker
      label={fields.account}
      placeholder={messages.accounts.placeholder}
      items={items}
      value={draft.paidFromAccountId}
      empty={{ icon: 'wallet', ...messages.accounts.empty }}
      onSelect={(paidFromAccountId) => onChange({ paidFromAccountId })}
    />
  )
}

function PurchasePicker({
  label,
  placeholder,
  items,
  value,
  empty,
  onSelect,
}: PurchasePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const anchor = useRef<HTMLButtonElement>(null)
  const chosen = items.find((item) => item.value === value)
  return (
    <FieldGroup label={label} isRequired>
      <PickerField
        ref={anchor}
        value={chosen?.label ?? null}
        detail={chosen?.detail}
        art={chosen && <CategoryArt name={chosen.label} icon={chosen.icon} size="lg" />}
        placeholder={placeholder}
        onClick={() => setIsOpen(true)}
      />
      <PickerSheet
        title={label}
        items={items as PickerItem[]}
        value={value || null}
        anchor={anchor}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSelect={(next) => {
          setIsOpen(false)
          onSelect(next)
        }}
        empty={empty}
      />
    </FieldGroup>
  )
}

function PurchasePlan({ card, totalCents, count, purchaseDate, today }: PurchasePlanProps) {
  const plan = installmentPlan({
    purchaseDate,
    card,
    totalCents,
    count,
    firstInstallment: 1,
    today,
  })
  const [first] = plan
  const last = plan.at(-1)
  if (!first) {
    return null
  }
  const due = dueText(first.invoice.dueOn, today)
  const rest = plan.length - SHOWN_ROWS
  return (
    <InvoicePreview
      className="-mt-1.5"
      title={count === 1 ? messages.installments.single(due) : messages.installments.first(due)}
      rows={plan.slice(0, SHOWN_ROWS).map((installment) => ({
        key: String(installment.installmentNo),
        number: messages.installments.number(installment.installmentNo, count),
        due: messages.installments.due(dueText(installment.invoice.dueOn, today)),
        amountCents: installment.amountCents,
        isClosed: installment.isInvoiceClosed,
      }))}
      more={
        rest > 0 && last
          ? messages.installments.rest(rest, formatShortDateWithYear(last.invoice.dueOn))
          : undefined
      }
    />
  )
}

function cardDetailOf(card: PurchaseCard): string {
  const due = messages.cards.due(formatShortDate(card.currentInvoice.dueOn as IsoDate))
  const free =
    card.freeLimitCents === null
      ? messages.cards.noLimit
      : messages.cards.free(formatBrl(card.freeLimitCents))
  return `${due} · ${free}`
}

function dueText(date: IsoDate, today: IsoDate): string {
  return parseIsoDate(date).year === parseIsoDate(today).year
    ? formatShortDate(date)
    : formatShortDateWithYear(date)
}
