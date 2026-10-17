import type { IsoDate } from '@financas/shared'
import type { ReactNode } from 'react'

export type ChargeChannel = 'whatsapp' | 'email' | 'manual'

export type ChargeBodyItem = {
  key: string
  description: string
  amountCents: number
}

export type ChargeActionIcon =
  | 'payment'
  | 'send'
  | 'pix'
  | 'retry'
  | 'whatsapp'
  | 'edit'
  | 'message'

export type ChargeAction = {
  key: string
  label: string
  icon?: ChargeActionIcon
  onPress: () => void
  isLoading?: boolean
}

export type ChargeSend = {
  via: ChargeChannel
  sentAt: string
  sentTo?: string | null
}

export type ChargeReceipt = {
  receivedCents: number
  receivedOn: IsoDate
  accountName: string
  leftCents: number
}

export type ChargeHistory =
  | { kind: 'sent'; send: ChargeSend; receipt?: ChargeReceipt }
  | { kind: 'received'; receipt: ChargeReceipt }
  | { kind: 'emailFailed'; sentTo: string }

export type ChargeBodyProps = {
  history?: ChargeHistory
  items: readonly ChargeBodyItem[]
  totalCents: number
  dueOn?: IsoDate | null
  isDuePast?: boolean
  message: ReactNode
  isMessageOpen?: boolean
  primaryAction?: ChargeAction
  actions?: readonly ChargeAction[]
}

export type ChargeHistoryLineProps = {
  history: ChargeHistory
}

export type ChargeSendTextProps = {
  send: ChargeSend
  receipt?: ChargeReceipt
}

export type ChargeReceiptTextProps = {
  receipt: ChargeReceipt
}

export type ChargeActionButtonProps = {
  action: ChargeAction
  isPrimary: boolean
}
