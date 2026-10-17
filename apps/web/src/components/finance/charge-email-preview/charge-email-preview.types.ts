import type { IsoDate } from '@financas/shared'

export type ChargeEmailItem = {
  key: string
  description: string
  detail?: string
  amountCents: number
}

export type ChargeEmailPix = {
  payload: string
  receiverName: string
  receiverCity: string
}

export type ChargeEmailPreviewProps = {
  subject: string
  sender: string
  replyTo?: string
  contactName: string
  requesterName: string
  workspaceName: string
  opening: string
  closing: string
  items: readonly ChargeEmailItem[]
  totalCents: number
  dueOn: IsoDate | null
  isOverdue: boolean
  pix: ChargeEmailPix | null
  className?: string
}
