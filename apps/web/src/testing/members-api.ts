import { MEMBER_A_ID, MEMBER_B_ID, WORKSPACE_ID } from '@web/testing/fake-api'
import type { FakeAnswer } from '@web/testing/testing.types'

const BASE = `/api/workspaces/${WORKSPACE_ID}`

const OWNER_ROLE = { roleId: 'role-owner', name: 'Dono', systemKey: 'owner' }

const ADMIN_ROLE = { roleId: 'role-admin', name: 'Admin', systemKey: 'admin' }

const MEMBER_ROLE = { roleId: 'role-member', name: 'Membro', systemKey: 'member' }

export const HOUSEHOLD_MEMBERS = [
  {
    membershipId: 'membership-a',
    userId: MEMBER_A_ID,
    displayName: 'Member A',
    email: 'member.a@exemplo.com',
    role: OWNER_ROLE,
    joinedAt: '2026-10-02T12:00:00.000Z',
    lastActivityAt: '2026-10-30T12:00:00.000Z',
  },
  {
    membershipId: 'membership-b',
    userId: MEMBER_B_ID,
    displayName: 'Member B',
    email: 'member.b@exemplo.com',
    role: ADMIN_ROLE,
    joinedAt: '2026-10-03T12:00:00.000Z',
    lastActivityAt: null,
  },
]

export function manyMembers(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    membershipId: `membership-${index}`,
    userId: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
    displayName: `Member ${index + 1}`,
    email: `member.${index + 1}@exemplo.com`,
    role: MEMBER_ROLE,
    joinedAt: '2026-10-04T12:00:00.000Z',
    lastActivityAt: null,
  }))
}

export function membersAnswer(
  members: readonly unknown[] = HOUSEHOLD_MEMBERS,
): Record<string, FakeAnswer> {
  return { [`GET ${BASE}/members`]: () => Response.json(members) }
}

const ALL_ACTIONS = ['view', 'create', 'update', 'delete']

function allOf(modules: readonly string[]) {
  return modules.flatMap((module) => ALL_ACTIONS.map((action) => ({ module, action })))
}

export const HOUSEHOLD_ROLES = [
  {
    ...OWNER_ROLE,
    description: null,
    permissions: allOf(['members', 'settings']),
    memberCount: 1,
    invitationCount: 0,
  },
  {
    ...ADMIN_ROLE,
    description: null,
    permissions: [
      ...allOf(['settings']),
      { module: 'members', action: 'view' },
      { module: 'members', action: 'update' },
    ],
    memberCount: 1,
    invitationCount: 0,
  },
  {
    ...MEMBER_ROLE,
    description: null,
    permissions: [{ module: 'settings', action: 'view' }],
    memberCount: 0,
    invitationCount: 1,
  },
  {
    roleId: 'role-accountant',
    name: 'Contador',
    systemKey: null,
    description: 'Vê tudo e anexa comprovantes. Não muda valores.',
    permissions: [{ module: 'members', action: 'delete' }],
    memberCount: 0,
    invitationCount: 0,
  },
]

export function rolesAnswer(
  roles: readonly unknown[] = HOUSEHOLD_ROLES,
): Record<string, FakeAnswer> {
  return { [`GET ${BASE}/roles`]: () => Response.json(roles) }
}

export const ADMIN_HOUSEHOLD = HOUSEHOLD_MEMBERS.map((member, index) => ({
  ...member,
  role: index === 0 ? ADMIN_ROLE : MEMBER_ROLE,
}))

export const PENDING_INVITATIONS = [
  {
    invitationId: 'invitation-c',
    email: 'member.c@exemplo.com',
    phoneE164: null,
    roleId: 'role-accountant',
    invitedByUserId: MEMBER_A_ID,
    expiresAt: '2026-10-24T12:00:00.000Z',
    createdAt: '2026-10-17T12:00:00.000Z',
  },
  {
    invitationId: 'invitation-d',
    email: null,
    phoneE164: '+5511999990005',
    roleId: 'role-member',
    invitedByUserId: MEMBER_B_ID,
    expiresAt: '2026-10-26T12:00:00.000Z',
    createdAt: '2026-10-19T12:00:00.000Z',
  },
]

export function invitationsAnswer(
  invitations: readonly unknown[] = PENDING_INVITATIONS,
): Record<string, FakeAnswer> {
  return { [`GET ${BASE}/invitations`]: () => Response.json(invitations) }
}
