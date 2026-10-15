import { EntriesPage } from '@web/features/entries/components/entries-page'
import { EntryDetailPage } from '@web/features/entries/components/entry-detail-page'
import type { EntryDetailScreenProps } from '@web/features/entries/entries.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'

export function EntryDetailScreen({
  listSearch,
  onListSearchChange,
  onClose,
  ...detail
}: EntryDetailScreenProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  if (!isDesktop) {
    return <EntryDetailPage {...detail} />
  }
  return (
    <>
      <EntriesPage
        workspaceId={detail.workspaceId}
        permissions={detail.permissions}
        currentUserId={detail.currentUserId}
        memberDirectory={detail.memberDirectory}
        search={listSearch}
        onSearchChange={onListSearchChange}
      />
      <EntryDetailPage {...detail} frame="panel" onClose={onClose} />
    </>
  )
}
