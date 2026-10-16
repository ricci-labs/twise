import { goalNumbers, monthsUntil } from '@shared/planning/goals/goal-numbers'
import { describe, expect, it } from 'vitest'

const TODAY = '2026-10-16'

describe('goalNumbers', () => {
  it('gives the percent, what is left and the monthly amount to reach the deadline', () => {
    expect(
      goalNumbers({ savedCents: 160_000, targetCents: 500_000, targetOn: '2027-07-31' }, TODAY),
    ).toEqual({
      percent: 32,
      remainingCents: 340_000,
      overCents: 0,
      monthlyToTargetCents: 37_778,
    })
  })

  it('has no monthly amount without a deadline', () => {
    expect(
      goalNumbers({ savedCents: 0, targetCents: 100_000, targetOn: null }, TODAY)
        .monthlyToTargetCents,
    ).toBeNull()
  })

  it('says how much a reached goal passed its target', () => {
    expect(
      goalNumbers({ savedCents: 520_000, targetCents: 500_000, targetOn: '2027-01-10' }, TODAY),
    ).toEqual({ percent: 100, remainingCents: 0, overCents: 20_000, monthlyToTargetCents: 0 })
  })

  it('treats a negative balance as nothing saved yet', () => {
    expect(
      goalNumbers({ savedCents: -5_000, targetCents: 100_000, targetOn: null }, TODAY),
    ).toMatchObject({ percent: 0, remainingCents: 105_000 })
  })
})

describe('monthsUntil', () => {
  it('counts the months from this one to the deadline', () => {
    expect(monthsUntil('2027-07-31', TODAY)).toBe(9)
    expect(monthsUntil('2026-11-01', TODAY)).toBe(1)
  })

  it('asks for the rest at once when the deadline is this month or past', () => {
    expect(monthsUntil('2026-10-31', TODAY)).toBe(1)
    expect(monthsUntil('2026-01-01', TODAY)).toBe(1)
  })
})
