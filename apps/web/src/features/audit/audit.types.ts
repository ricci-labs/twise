import type { IsoDate } from '@financas/shared'
import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query'
import type { fetchAuditPage } from '@web/features/audit/api/audit.queries'
import type { historySearchSchema } from '@web/features/audit/audit.schemas'
import type { z } from 'zod'

type AuditPage = Awaited<ReturnType<typeof fetchAuditPage>>

export type AuditEvent = AuditPage['items'][number]

export type AuditFieldChange = AuditEvent['changes'][number]

export type AuditFieldValue = AuditFieldChange['before']

export type HistorySearch = z.infer<typeof historySearchSchema>

export type HistoryFilter = Parameters<typeof fetchAuditPage>[1]

export type AuditDay = {
  date: IsoDate
  title: string
  events: AuditEvent[]
}

export type HistoryPageProps = {
  workspaceId: string
  workspaceName: string
  search: HistorySearch
  onSearchChange: (change: Partial<HistorySearch>) => void
}

export type HistoryListProps = HistoryPageProps & {
  today: IsoDate
}

export type HistoryDaysProps = Pick<HistoryPageProps, 'workspaceId'> & {
  days: readonly AuditDay[]
  selectedId?: string
}

export type HistoryEmptyProps = Pick<HistoryPageProps, 'search' | 'onSearchChange'>

export type AuditChangeSheetProps = {
  workspaceId: string
  event: AuditEvent
  today: IsoDate
  onClose: () => void
}

export type HistoryMoreProps = {
  list: UseInfiniteQueryResult<InfiniteData<AuditPage>>
}
