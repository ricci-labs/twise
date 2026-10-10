import {
  APP_MODULES,
  DEMO_MEMBER_NAMES,
  DEMO_ROLE_NAME,
  DEMO_WORKSPACE_IDS,
  DEMO_WORKSPACE_NAME,
  type DemoVariant,
  PERMISSION_ACTIONS,
} from '@financas/shared'

const DEMO_FOREVER = Number.POSITIVE_INFINITY

export function demoVariantOf(workspaceId: string): DemoVariant | undefined {
  const entry = Object.entries(DEMO_WORKSPACE_IDS).find(([, id]) => id === workspaceId)
  return entry?.[0] as DemoVariant | undefined
}

export function isDemoWorkspace(workspaceId: string): boolean {
  return demoVariantOf(workspaceId) !== undefined
}

export function demoFreshness(workspaceId: string) {
  return isDemoWorkspace(workspaceId) ? { staleTime: DEMO_FOREVER } : {}
}

const DEMO_ROLE = { roleId: 'demo-owner', name: DEMO_ROLE_NAME, systemKey: 'owner' } as const

export function demoWorkspace(workspaceId: string) {
  return { workspaceId, name: DEMO_WORKSPACE_NAME, isArchived: false, role: DEMO_ROLE }
}

export function demoWorkspaceAccess(workspaceId: string) {
  return {
    workspace: { workspaceId, name: DEMO_WORKSPACE_NAME, isArchived: false },
    membershipId: 'demo-membership',
    role: DEMO_ROLE,
    permissions: APP_MODULES.flatMap((module) =>
      PERMISSION_ACTIONS.map((action) => ({ module, action })),
    ),
    memberNames: [...DEMO_MEMBER_NAMES],
  }
}
