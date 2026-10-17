export const openItemRowMessages = {
  dueOn: (date: string) => `${date}: `,
  overdue: 'Atrasado',
  inCharge: (date: string) => `Na cobrança de ${date}`,
} as const
