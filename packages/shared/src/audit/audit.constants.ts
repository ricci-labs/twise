export const AUDIT_ACTIONS = [
  'create',
  'update',
  'archive',
  'unarchive',
  'delete',
  'restore',
] as const

export type AuditAction = (typeof AUDIT_ACTIONS)[number]

export const AUDIT_SOURCES = ['web', 'whatsapp', 'job', 'ops', 'system'] as const

export type AuditSource = (typeof AUDIT_SOURCES)[number]

export const AUTOMATIC_ACTOR = 'automatic'
export const AUDIT_AREAS = {
  entries: ['journal_entries', 'entry_attachments'],
  accounts: ['ledger_accounts'],
  cards: ['card_details'],
  contacts: ['contacts'],
  charges: ['charges', 'charge_payments', 'charge_attachments'],
  planning: [
    'recurrence_rules',
    'planned_occurrences',
    'budget_lines',
    'goals',
    'allocation_steps',
    'workspace_holidays',
  ],
  members: ['memberships', 'membership_preferences', 'roles', 'role_permissions', 'invitations'],
  settings: ['workspaces', 'workspace_settings'],
} as const satisfies Record<string, readonly string[]>

export type AuditArea = keyof typeof AUDIT_AREAS

export const AUDIT_AREA_KEYS = Object.keys(AUDIT_AREAS) as [AuditArea, ...AuditArea[]]
