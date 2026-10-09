import { forgetWorkspaceCreated, wasJustCreated } from '@web/lib/workspace-created'
import { useEffect, useState } from 'react'

export function useJustCreated(workspaceId: string): boolean {
  const [isJustCreated] = useState(() => wasJustCreated(workspaceId))
  useEffect(() => {
    forgetWorkspaceCreated(workspaceId)
  }, [workspaceId])
  return isJustCreated
}
