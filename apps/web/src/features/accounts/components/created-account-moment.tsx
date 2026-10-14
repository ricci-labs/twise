import { MONEY_ACCOUNT_KINDS } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { MomentSheet } from '@web/components/feedback/moment-sheet'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type { CreatedAccountMomentProps } from '@web/features/accounts/accounts.types'
import { accountsQueryOptions } from '@web/features/accounts/api/accounts.queries'
import { useState } from 'react'

const messages = accountsMessages.created
const MONEY_KINDS: readonly string[] = MONEY_ACCOUNT_KINDS

export function CreatedAccountMoment({ workspaceId, createdId }: CreatedAccountMomentProps) {
  const navigate = useNavigate()
  const [momentId, setMomentId] = useState(createdId)
  const [lastCreatedId, setLastCreatedId] = useState(createdId)
  const accounts = useQuery(accountsQueryOptions(workspaceId)).data ?? []
  const account = accounts.find((item) => item.id === momentId)

  if (createdId !== lastCreatedId) {
    setLastCreatedId(createdId)
    if (createdId) {
      setMomentId(createdId)
    }
  }

  if (!account || !MONEY_KINDS.includes(account.kind)) {
    return null
  }
  const close = () => setMomentId(undefined)
  return (
    <MomentSheet
      art={account.icon ?? 'wallet'}
      title={messages.title(account.name)}
      text={messages.text}
      actionLabel={messages.openingBalance}
      dismissLabel={messages.later}
      isOpen
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          close()
        }
      }}
      onAction={() => {
        close()
        void navigate({
          to: '.',
          search: (previous) => ({
            ...previous,
            entry: 'new',
            entryType: 'opening_balance',
            entryAccount: account.id,
          }),
        })
      }}
    />
  )
}
