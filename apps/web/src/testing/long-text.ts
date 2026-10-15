import { expect } from 'vitest'

export const LONG_TEXT = {
  description: 'Internet fibra 1 giga com TV e telefone',
  account: 'Conta Conjunta do Banco Exemplo',
  person: 'Fulana de Tal dos Santos Silva',
  amountCents: 123456789,
  amount: 'R$ 1.234.567,89',
} as const

const MAX_LINES = 2
const ONE_LINE_LIMIT = 2
const ROUNDING_PX = 1

function linesOf(element: Element): number {
  const lineHeight = Number.parseFloat(getComputedStyle(element).lineHeight)
  return Math.round(element.getBoundingClientRect().height / lineHeight)
}

export function expectClampedToTwoLines(text: Element) {
  expect(linesOf(text)).toBe(MAX_LINES)
  expect(text.scrollHeight).toBeGreaterThan(text.clientHeight)
}

export function expectWholeAmount(amount: Element, row: Element) {
  const box = amount.getBoundingClientRect()
  const fontSize = Number.parseFloat(getComputedStyle(amount).fontSize)
  expect(box.height).toBeLessThan(fontSize * ONE_LINE_LIMIT)
  expect(amount.scrollWidth).toBeLessThanOrEqual(amount.clientWidth + ROUNDING_PX)
  expect(box.right).toBeLessThanOrEqual(row.getBoundingClientRect().right + ROUNDING_PX)
}
