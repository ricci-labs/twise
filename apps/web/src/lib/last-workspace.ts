const LAST_WORKSPACE_KEY = 'lastWorkspaceId'

export function lastWorkspaceId(): string | null {
  try {
    return localStorage.getItem(LAST_WORKSPACE_KEY)
  } catch {
    return null
  }
}

export function rememberWorkspace(workspaceId: string): void {
  try {
    localStorage.setItem(LAST_WORKSPACE_KEY, workspaceId)
  } catch {
    return
  }
}
