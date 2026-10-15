import { Link } from '@tanstack/react-router'

export function accountEntriesLink(workspaceId: string, accountId: string) {
  return (
    <Link
      to="/w/$workspaceId/entries"
      params={{ workspaceId }}
      search={{ accountId, back: 'accounts' }}
    />
  )
}

export function categoryEntriesLink(workspaceId: string, categoryId: string) {
  return (
    <Link
      to="/w/$workspaceId/entries"
      params={{ workspaceId }}
      search={{ categoryId, back: 'categories' }}
    />
  )
}
