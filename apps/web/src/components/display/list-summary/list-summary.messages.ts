export const listSummaryMessages = {
  out: 'Saiu ',
  in: 'Entrou ',
  count: (count: number) => `${count} ${count === 1 ? 'lançamento' : 'lançamentos'}`,
} as const
