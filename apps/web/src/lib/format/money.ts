import { parseBrl } from '@financas/shared'

const CENTS_PER_REAL = 100
const WHOLE_REAIS = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})
const TYPED_AMOUNT = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatWholeReais(cents: number): string {
  return WHOLE_REAIS.format(Math.round(cents / CENTS_PER_REAL))
}

export function formatTypedAmount(cents: number): string {
  return TYPED_AMOUNT.format(cents / CENTS_PER_REAL)
}

export function centsOfTypedAmount(text: string): number | null {
  try {
    return parseBrl(text.trim())
  } catch {
    return null
  }
}

export function sumOfTypedAmounts(texts: readonly string[]): number {
  return texts.reduce((sum, text) => sum + (centsOfTypedAmount(text) ?? 0), 0)
}

export function tidyTypedAmount(text: string): string {
  const cents = centsOfTypedAmount(text)
  return cents === null ? text : formatTypedAmount(cents)
}
