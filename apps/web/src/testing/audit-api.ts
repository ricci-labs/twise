import { MEMBER_A_ID, MEMBER_B_ID, WORKSPACE_ID } from '@web/testing/fake-api'
import type { FakeAnswer } from '@web/testing/testing.types'

const BASE = `/api/workspaces/${WORKSPACE_ID}`

export const PADARIA_ID = '00000000-0000-4000-8000-00000000e001'

const MEMBER_A = { id: MEMBER_A_ID, name: 'Member A' }

const MEMBER_B = { id: MEMBER_B_ID, name: 'Member B' }

function event(id: number, fields: Record<string, unknown>) {
  return {
    id: `00000000-0000-4000-8000-${String(id).padStart(12, '0')}`,
    at: '2026-10-30T14:05:00.000Z',
    actorUserId: MEMBER_A_ID,
    actor: MEMBER_A,
    source: 'web',
    traceId: `a91b2f07${String(id).padStart(24, '0')}`,
    action: 'create',
    tableName: 'journal_entries',
    rowId: PADARIA_ID,
    area: 'entries',
    entityLabel: 'Padaria',
    before: null,
    after: null,
    changes: [],
    ...fields,
  }
}

function change(field: string, kind: string, before: unknown, after: unknown) {
  return { field, kind, reference: null, before, after, changed: before !== after }
}

export const EDITED_PADARIA = event(1, {
  at: '2026-10-30T14:05:00.000Z',
  actorUserId: MEMBER_B_ID,
  actor: MEMBER_B,
  action: 'update',
  changes: [
    change('amountCents', 'money', 1850, 2100),
    change('description', 'text', 'Padaria', 'Padaria'),
    change('occurredOn', 'date', '2026-10-19', '2026-10-19'),
    {
      ...change('categoryId', 'reference', null, null),
      reference: 'account',
      before: { name: 'Padaria', parentName: 'Mercado' },
      after: { name: 'Padaria', parentName: 'Mercado' },
      changed: false,
    },
  ],
})

export const RECORDED_MERCADO = event(2, {
  at: '2026-10-30T13:10:00.000Z',
  rowId: '00000000-0000-4000-8000-00000000e002',
  entityLabel: 'Mercado da semana',
  changes: [
    change('amountCents', 'money', null, 8640),
    change('description', 'text', null, 'Mercado da semana'),
  ],
})

export const RECORDED_UBER = event(3, {
  at: '2026-10-30T00:40:00.000Z',
  actorUserId: MEMBER_B_ID,
  actor: MEMBER_B,
  source: 'whatsapp',
  rowId: '00000000-0000-4000-8000-00000000e003',
  entityLabel: 'Uber',
  changes: [change('amountCents', 'money', null, 2390)],
})

export const ROLE_CHANGED = event(4, {
  at: '2026-10-29T21:02:00.000Z',
  tableName: 'memberships',
  area: 'members',
  rowId: '00000000-0000-4000-8000-00000000e004',
  action: 'update',
  entityLabel: 'Member B',
  changes: [
    {
      ...change('roleId', 'reference', null, null),
      reference: 'role',
      before: { name: 'Membro', parentName: null },
      after: { name: 'Admin', parentName: null },
      changed: true,
    },
  ],
})

export const DELETED_CARTEIRA = event(5, {
  at: '2026-10-13T22:15:00.000Z',
  tableName: 'ledger_accounts',
  area: 'accounts',
  rowId: '00000000-0000-4000-8000-00000000e005',
  action: 'delete',
  entityLabel: 'Carteira',
  changes: [
    change('name', 'text', 'Carteira', 'Carteira'),
    change('kind', 'choice', 'cash_wallet', 'cash_wallet'),
  ],
})

export const AUTOMATIC_OCCURRENCE = event(6, {
  at: '2026-10-30T09:00:00.000Z',
  actorUserId: null,
  actor: null,
  source: 'job',
  traceId: null,
  tableName: 'planned_occurrences',
  area: 'planning',
  rowId: '00000000-0000-4000-8000-00000000e006',
  entityLabel: 'Internet',
  changes: [
    change('dueOn', 'date', null, '2026-11-18'),
    change('amountCents', 'money', null, 12000),
  ],
})

export const HOUSEHOLD_EVENTS = [
  EDITED_PADARIA,
  RECORDED_MERCADO,
  AUTOMATIC_OCCURRENCE,
  RECORDED_UBER,
  ROLE_CHANGED,
  DELETED_CARTEIRA,
]

export function auditAnswer(
  pages: readonly (readonly unknown[])[] = [HOUSEHOLD_EVENTS],
): Record<string, FakeAnswer> {
  return {
    [`GET ${BASE}/audit`]: (request) => {
      const cursor = new URL(request.url).searchParams.get('cursor')
      const index = cursor ? Number(cursor) : 0
      const hasMore = index + 1 < pages.length
      return Response.json({
        items: pages[index] ?? [],
        nextCursor: hasMore ? String(index + 1) : null,
      })
    },
  }
}

export function manyEvents(count: number, start = 100) {
  return Array.from({ length: count }, (_, index) =>
    event(start + index, {
      rowId: `00000000-0000-4000-8000-${String(start + index).padStart(12, '0')}`,
      entityLabel: `Compra ${start + index}`,
      changes: [change('amountCents', 'money', null, 1000)],
    }),
  )
}
