import { addDays, type IsoDate, todayIn } from '@financas/shared'
import { membersMessages } from '@web/features/members/members.messages'
import { formatFullDate } from '@web/lib/format/calendar'

const TIME_ZONE = 'America/Sao_Paulo'
const TIME = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: TIME_ZONE,
})
const messages = membersMessages.desktop

export function lastActivityText(at: string | null, today: IsoDate): string {
  if (at === null) {
    return messages.noActivity
  }
  const moment = new Date(at)
  const day = todayIn(TIME_ZONE, moment)
  if (day === today) {
    return messages.today(TIME.format(moment))
  }
  if (day === addDays(today, -1)) {
    return messages.yesterday(TIME.format(moment))
  }
  return formatFullDate(day)
}

export function dayOf(at: string): IsoDate {
  return todayIn(TIME_ZONE, new Date(at))
}
