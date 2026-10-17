export const chargePreviewMessages = {
  heading: (count: number) => `Vai na cobrança · ${count} ${count === 1 ? 'item' : 'itens'}`,
  overdue: (day: string) => `venceu ${day}`,
  due: (day: string) => `vence ${day}`,
  total: 'Total',
} as const
