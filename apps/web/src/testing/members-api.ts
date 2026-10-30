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
