import { stepsWithoutGoal } from '@web/features/planning/components/allocation-steps'
import { describe, expect, it } from 'vitest'

const GOAL = '00000000-0000-4000-8000-0000000009c2'
const ACCOUNT = '00000000-0000-4000-8000-0000000000c1'
const NONE = { goalId: null, accountId: null, percent: null, amountCents: null }

describe('stepsWithoutGoal', () => {
  it('drops the steps that fill a goal and keeps the others as inputs', () => {
    expect(
      stepsWithoutGoal(
        [
          { ...NONE, position: 1, kind: 'fill_goal', goalId: GOAL },
          { ...NONE, position: 2, kind: 'percent', accountId: ACCOUNT, percent: 20 },
          { ...NONE, position: 3, kind: 'cover_overspent' },
          { ...NONE, position: 4, kind: 'rest', accountId: ACCOUNT },
        ],
        GOAL,
      ),
    ).toEqual([
      { kind: 'percent', accountId: ACCOUNT, percent: 20 },
      { kind: 'cover_overspent' },
      { kind: 'rest', accountId: ACCOUNT },
    ])
  })

  it('leaves the split alone when no step uses the goal', () => {
    expect(
      stepsWithoutGoal([{ ...NONE, position: 1, kind: 'rest', accountId: ACCOUNT }], GOAL),
    ).toBeUndefined()
  })
})
