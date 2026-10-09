const justCreated = new Set<string>()

export function markWorkspaceCreated(workspaceId: string): void {
  justCreated.add(workspaceId)
}

export function wasJustCreated(workspaceId: string): boolean {
  return justCreated.has(workspaceId)
}

export function forgetWorkspaceCreated(workspaceId: string): void {
  justCreated.delete(workspaceId)
}
