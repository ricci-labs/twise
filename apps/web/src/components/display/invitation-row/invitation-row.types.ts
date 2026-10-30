import type { IsoDate } from '@financas/shared'
import type { ReactNode } from 'react'

export type InvitationChannel = 'email' | 'phone'

export type InvitationRowProps = {
  channel: InvitationChannel
  contact: string
  roleName: string
  isCustomRole: boolean
  expiresOn: IsoDate
  invitedBy: string
  invitedOn: IsoDate
  actions?: ReactNode
}
