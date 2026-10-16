export const reserveCardMessages = {
  title: 'Reserva de emergência',
  ofTarget: 'de {target} · guardado em {account}',
  covers: 'Cobre **{months}** de gastos',
  month: (count: string, isOne: boolean) => (isOne ? `${count} mês` : `${count} meses`),
  left: '{percent}% · faltam {amount}',
  over: '{percent}% · passou {amount}',
  done: '{percent}% · completa',
  progress: (percent: number) => `${percent}% da reserva`,
  empty:
    'Ainda não tem. Ela guarda alguns meses de gastos para imprevistos, e o app mostra quanto ela cobre.',
} as const
