import { DEMO_IDS, DEMO_NAMES, type DemoScenario, demoFacts, demoOverview } from '@financas/shared'
import { WORKSPACE_ID } from '@web/testing/fake-api'
import type { FakeAnswer } from '@web/testing/testing.types'

const PERIOD_SCENARIOS: Readonly<Record<string, DemoScenario>> = {
  '2026-09': 'closed',
  '2026-11': 'future',
}

export function demoAnswers(scenario: DemoScenario = 'current'): Record<string, FakeAnswer> {
  const base = `/api/workspaces/${WORKSPACE_ID}`
  return {
    [`GET ${base}/overview`]: (request) => {
      const period = new URL(request.url).searchParams.get('period')
      return Response.json(demoOverview((period && PERIOD_SCENARIOS[period]) || scenario))
    },
    [`GET ${base}/accounts`]: () => Response.json(demoAccounts()),
    [`GET ${base}/contacts`]: () => Response.json(demoContacts()),
  }
}

function demoAccounts() {
  return demoFacts('current').accounts.map((account, sortOrder) => ({
    ...account,
    name: DEMO_NAMES[account.id] ?? account.id,
    currency: 'BRL',
    ownerUserId: null,
    isSystem: false,
    sortOrder,
    color: null,
    icon: null,
    archivedAt: null,
  }))
}

function demoContacts() {
  return [DEMO_IDS.contactC, DEMO_IDS.contactD, DEMO_IDS.contactE].map((id) => ({
    id,
    name: DEMO_NAMES[id] ?? id,
    phoneE164: null,
    pixKey: null,
    notes: null,
    isOptedOut: false,
    isArchived: false,
  }))
}
