import type { FakeAnswer } from '@web/testing/testing.types'
import { vi } from 'vitest'

const SESSION_REQUIRED = 401
const NOT_FOUND = 404

export function fakeApi(answers: Record<string, FakeAnswer>) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
    const request = new Request(
      input instanceof Request ? input : new URL(String(input), location.href),
      init,
    )
    const { pathname } = new URL(request.url)
    const method = request.method.toUpperCase()
    const answer = answers[`${method} ${pathname}`] ?? answers[pathname]
    return Promise.resolve(answer ? answer(request) : Response.json({}, { status: NOT_FOUND }))
  })
}

export function apiError(
  code: string,
  status: number,
  headers: Record<string, string> = {},
): Response {
  return Response.json({ error: { code, message: code, ref: 'abcd1234' } }, { status, headers })
}

export function sessionRequired(): Response {
  return apiError('SESSION_REQUIRED', SESSION_REQUIRED)
}

export function account(): Response {
  return Response.json({ id: 'user-a', email: 'member.a@exemplo.com', displayName: 'Member A' })
}

export const WORKSPACE_ID = '00000000-0000-4000-8000-0000000000aa'

export function workspaceList(
  workspaces: { workspaceId: string; name: string }[] = [
    { workspaceId: WORKSPACE_ID, name: 'Casa' },
  ],
): Response {
  return Response.json(
    workspaces.map((workspace) => ({
      ...workspace,
      isArchived: false,
      role: { roleId: 'role-owner', name: 'Dono', systemKey: 'owner' },
    })),
  )
}

const MODULES = ['entries', 'accounts', 'cards', 'contacts', 'planning', 'budgets', 'reports']
const ADMIN_MODULES = ['settings', 'members', 'audit', 'attachments']
const ACTIONS = ['view', 'create', 'update', 'delete']

export const OWNER_PERMISSIONS = [...MODULES, ...ADMIN_MODULES].flatMap((module) =>
  ACTIONS.map((action) => ({ module, action })),
)

export const VIEWER_PERMISSIONS = MODULES.map((module) => ({ module, action: 'view' }))

export function workspaceAccess(): Response {
  return accessAs('Dono', OWNER_PERMISSIONS)
}

export function accessAs(
  roleName: string,
  permissions: { module: string; action: string }[],
): Response {
  return Response.json({
    workspace: { workspaceId: WORKSPACE_ID, name: 'Casa', isArchived: false },
    membershipId: 'membership-a',
    role: { roleId: `role-${roleName}`, name: roleName, systemKey: null },
    permissions,
    memberNames: ['Member A', 'Member B'],
  })
}
