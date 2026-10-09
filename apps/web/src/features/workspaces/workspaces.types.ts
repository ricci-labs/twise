import type {
  fetchWorkspaceAccess,
  fetchWorkspaces,
} from '@web/features/workspaces/api/workspaces.queries'
import type { workspacePickerSearchSchema } from '@web/features/workspaces/workspaces.schemas'
import type { ReactNode } from 'react'
import type { z } from 'zod'

export type WorkspacePickerSearch = z.infer<typeof workspacePickerSearchSchema>

export type WorkspaceListItem = Awaited<ReturnType<typeof fetchWorkspaces>>[number]

export type WorkspaceAccess = Awaited<ReturnType<typeof fetchWorkspaceAccess>>

export type WorkspaceChoice =
  | { kind: 'open'; workspaceId: string }
  | { kind: 'pick' }
  | { kind: 'create' }

export type CreateWorkspacePageProps = {
  email: string
  logOut: ReactNode
}

export type WorkspaceListProps = {
  workspaces: readonly WorkspaceListItem[]
  currentId?: string
}

export type WorkspacePickerPageProps = {
  isLost?: boolean
}
