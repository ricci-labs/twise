import {
  APP_MODULES,
  DEMO_WORKSPACE_IDS,
  type DemoVariant,
  PERMISSION_ACTIONS,
} from '@financas/shared'
import { demoMessages } from '@web/features/demo/demo.messages'
import type { DemoHomeProps } from '@web/features/demo/demo.types'

const EVERY_PERMISSION = APP_MODULES.flatMap((module) =>
  PERMISSION_ACTIONS.map((action) => ({ module, action })),
)
const DEMO_MEMBERS = 2

export function demoHomeProps(variant: DemoVariant, period: string | undefined): DemoHomeProps {
  return {
    workspaceId: DEMO_WORKSPACE_IDS[variant],
    period,
    displayName: demoMessages.displayName,
    permissions: EVERY_PERMISSION,
    workspaceName: demoMessages.workspaceName,
    memberCount: DEMO_MEMBERS,
  }
}
