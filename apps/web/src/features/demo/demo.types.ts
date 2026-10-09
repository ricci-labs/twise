import type { DemoVariant, Permission } from '@financas/shared'
import type { demoSearchSchema } from '@web/features/demo/demo.schemas'
import type { ReactNode } from 'react'
import type { z } from 'zod'

export type DemoSearch = z.infer<typeof demoSearchSchema>

export type DemoFrameProps = {
  variant: DemoVariant
  children: ReactNode
}

export type DemoHomeProps = {
  workspaceId: string
  period?: string
  displayName: string
  permissions: readonly Permission[]
  workspaceName: string
  memberCount: number
}
