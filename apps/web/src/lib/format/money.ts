const CENTS_PER_REAL = 100
const WHOLE_REAIS = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})

export function formatWholeReais(cents: number): string {
  return WHOLE_REAIS.format(Math.round(cents / CENTS_PER_REAL))
}
