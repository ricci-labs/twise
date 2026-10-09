import { useQueryClient } from '@tanstack/react-query'
import { workspacesMessages } from '@web/features/workspaces/workspaces.messages'

const UPDATED_TIME = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  hour: '2-digit',
  minute: '2-digit',
})

export function LastUpdated() {
  const queryClient = useQueryClient()
  const updatedAt = Math.max(
    0,
    ...queryClient
      .getQueryCache()
      .getAll()
      .map((query) => query.state.dataUpdatedAt),
  )
  if (updatedAt === 0) {
    return null
  }
  return (
    <span className="hidden opacity-75 lg:inline">
      {workspacesMessages.shell.updatedAt(UPDATED_TIME.format(updatedAt))}
    </span>
  )
}
