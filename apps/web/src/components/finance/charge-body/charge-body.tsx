import { formatBrl } from '@financas/shared'
import { ActionGrid } from '@web/components/actions/action-grid'
import { Button } from '@web/components/actions/button'
import { Amount } from '@web/components/display/amount'
import { chargeBodyMessages as messages } from '@web/components/finance/charge-body/charge-body.messages'
import type {
  ChargeActionButtonProps,
  ChargeActionIcon,
  ChargeBodyProps,
  ChargeChannel,
  ChargeHistoryLineProps,
  ChargeReceiptTextProps,
  ChargeSendTextProps,
} from '@web/components/finance/charge-body/charge-body.types'
import {
  chargeBodyVariants,
  chargeHistoryVariants,
  chargeItemAmountVariants,
  chargeItemLeaderVariants,
  chargeItemsVariants,
  chargeItemTextVariants,
  chargeItemVariants,
  chargeMessageVariants,
} from '@web/components/finance/charge-body/charge-body.variants'
import { formatShortDate } from '@web/lib/format/calendar'
import { formatDayOfMonth, formatTime } from '@web/lib/format/date'
import {
  Banknote,
  CircleAlert,
  Copy,
  type LucideIcon,
  Mail,
  MessageCircle,
  Pencil,
  QrCode,
  RotateCw,
  Send,
} from 'lucide-react'

export function ChargeBody({
  history,
  items,
  totalCents,
  dueOn,
  isDuePast = false,
  message,
  isMessageOpen = true,
  primaryAction,
  actions = [],
}: ChargeBodyProps) {
  const due = dueOn && (isDuePast ? messages.duePast : messages.dueFuture)(formatShortDate(dueOn))
  const buttons = primaryAction ? [primaryAction, ...actions] : actions
  return (
    <div data-slot="charge-body" className={chargeBodyVariants()}>
      {history && <ChargeHistoryLine history={history} />}
      <ul className={chargeItemsVariants()}>
        {items.map((item) => (
          <li key={item.key} className={chargeItemVariants()}>
            <span className={chargeItemTextVariants()}>{item.description}</span>
            <span aria-hidden="true" className={chargeItemLeaderVariants()} />
            <Amount
              cents={item.amountCents}
              size="inherit"
              className={chargeItemAmountVariants()}
            />
          </li>
        ))}
        <li className={chargeItemVariants({ isTotal: true })}>
          <span className={chargeItemTextVariants()}>
            {messages.total}
            {due}
          </span>
          <span aria-hidden="true" className={chargeItemLeaderVariants()} />
          <Amount cents={totalCents} size="inherit" className={chargeItemAmountVariants()} />
        </li>
      </ul>
      <details open={isMessageOpen} className={chargeMessageVariants()}>
        <summary>{messages.message}</summary>
        {message}
      </details>
      {buttons.length > 0 && (
        <ActionGrid layout={primaryAction ? 'primary' : 'even'} label={messages.actions}>
          {buttons.map((action) => (
            <ChargeActionButton
              key={action.key}
              action={action}
              isPrimary={action === primaryAction}
            />
          ))}
        </ActionGrid>
      )}
    </div>
  )
}

function ChargeHistoryLine({ history }: ChargeHistoryLineProps) {
  if (history.kind === 'emailFailed') {
    return (
      <p className={chargeHistoryVariants({ tone: 'danger' })}>
        <CircleAlert aria-hidden="true" />
        <span>
          {messages.emailFailedBefore}
          <b>{history.sentTo}</b>
          {messages.emailFailedAfter}
        </span>
      </p>
    )
  }
  if (history.kind === 'received') {
    return (
      <p className={chargeHistoryVariants()}>
        <Banknote aria-hidden="true" />
        <span>
          <ChargeReceiptText receipt={history.receipt} />
        </span>
      </p>
    )
  }
  const ChannelIcon = CHANNEL_ICONS[history.send.via]
  return (
    <p className={chargeHistoryVariants()}>
      <ChannelIcon aria-hidden="true" />
      <ChargeSendText send={history.send} receipt={history.receipt} />
    </p>
  )
}

function ChargeSendText({ send, receipt }: ChargeSendTextProps) {
  const day = formatDayOfMonth(send.sentAt)
  if (receipt) {
    return (
      <span>
        {messages.sent[send.via]}
        {messages.onDay(day)}
        {messages.separator}
        <ChargeReceiptText receipt={receipt} />
      </span>
    )
  }
  return (
    <span>
      {messages.sent[send.via]}
      {messages.onDayAt(day, formatTime(send.sentAt))}
      {send.sentTo && (
        <>
          {messages.to}
          <b>{send.sentTo}</b>
        </>
      )}
    </span>
  )
}

function ChargeReceiptText({ receipt }: ChargeReceiptTextProps) {
  return (
    <>
      <b>{messages.received(formatBrl(receipt.receivedCents))}</b>
      {messages.receivedWhere(formatShortDate(receipt.receivedOn), receipt.accountName)}
      {receipt.leftCents > 0 && messages.left(formatBrl(receipt.leftCents))}
    </>
  )
}

function ChargeActionButton({ action, isPrimary }: ChargeActionButtonProps) {
  const Icon = action.icon && ACTION_ICONS[action.icon]
  return (
    <Button
      variant={isPrimary ? 'primary' : 'secondary'}
      isLoading={action.isLoading}
      onClick={action.onPress}
    >
      {Icon && <Icon aria-hidden="true" />}
      {action.label}
    </Button>
  )
}

const CHANNEL_ICONS = {
  email: Mail,
  whatsapp: MessageCircle,
  manual: Copy,
} as const satisfies Record<ChargeChannel, LucideIcon>

const ACTION_ICONS = {
  payment: Banknote,
  send: Send,
  pix: QrCode,
  retry: RotateCw,
  whatsapp: MessageCircle,
  edit: Pencil,
  message: Copy,
} as const satisfies Record<ChargeActionIcon, LucideIcon>
