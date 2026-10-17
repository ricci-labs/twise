export const nothingToChargeMessages = {
  title: 'Nada a cobrar até essa data.',
  inCharge: (day: string) => `O que venceu já está na cobrança de ${day}.`,
  nothingDue: 'Nenhum item vence até essa data.',
  nextDue: (day: string) => ` A próxima parcela vence em ${day}.`,
  includeNext: (day: string, amount: string) => `Incluir até ${day} · ${amount}`,
} as const
