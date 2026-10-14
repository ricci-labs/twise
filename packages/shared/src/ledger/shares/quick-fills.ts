import type { Cents } from '@shared/core/money/money.types'

const HALVES = 2
const YOU = 1

export function equalShares(totalCents: Cents, contactCount: number): Cents[] {
  return sameShares(Math.floor(totalCents / (contactCount + YOU)), contactCount)
}

export function halfShares(totalCents: Cents, contactCount: number): Cents[] {
  if (contactCount === 0) {
    return []
  }
  return sameShares(Math.floor(Math.floor(totalCents / HALVES) / contactCount), contactCount)
}

function sameShares(eachCents: Cents, contactCount: number): Cents[] {
  return Array.from({ length: contactCount }, () => eachCents)
}
