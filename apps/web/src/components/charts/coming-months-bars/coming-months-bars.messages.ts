export const comingMonthsBarsMessages = {
  committed: 'Já comprometido',
  purchase: 'Esta compra',
  reference: (percent: number) => `${percent}% da renda fixa`,
  percent: (value: number) => `${value}%`,
  arrow: ' → ',
  changed: (month: string, before: number, after: number) =>
    `${month}: ${before}% para ${after}% da renda fixa`,
  unchanged: (month: string, value: number) => `${month}: ${value}% da renda fixa, sem mudança`,
  over: 'passa de 100%',
} as const
