import { type IsoDate, todayIn } from '@financas/shared'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type { DeletedWords, RestoreRefusal } from '@web/features/entries/entries.types'
import { ApiError } from '@web/lib/api/api-error'
import { formatShortDate } from '@web/lib/format/calendar'

const messages = entriesMessages.list.trashPage
const TIME_ZONE = 'America/Sao_Paulo'
const TIME = new Intl.DateTimeFormat('pt-BR', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
})

export function deletedLineOf(
  deletedAt: string,
  name: string | undefined,
  today: IsoDate,
  words: DeletedWords = messages.deleted,
): string {
  const moment = new Date(deletedAt)
  const day = todayIn(TIME_ZONE, moment) as IsoDate
  if (day === today) {
    const time = TIME.format(moment)
    return name ? words.today(time, name) : words.todayAnonymous(time)
  }
  const date = formatShortDate(day)
  return name ? words.on(date, name) : words.onAnonymous(date)
}

const CANNOT_BE_RESTORED = 'ENTRY_CANNOT_BE_RESTORED'

export function restoreRefusalOf(error: unknown): RestoreRefusal | undefined {
  if (!(error instanceof ApiError) || error.code !== CANNOT_BE_RESTORED) {
    return undefined
  }
  const { reason, accountId, accountName } = error.details
  if (reason === 'deleted_account' && accountId && accountName) {
    return {
      message: messages.refused.deleted_account(accountName),
      account: { id: accountId, name: accountName },
    }
  }
  if (reason === 'closed_invoice' || reason === 'replaced') {
    return { message: messages.refused[reason] }
  }
  return undefined
}
