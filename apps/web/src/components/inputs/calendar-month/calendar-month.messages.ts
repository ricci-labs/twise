export const calendarMonthMessages = {
  previous: 'Mês anterior',
  next: 'Próximo mês',
  month: (name: string, year: number) => `${name} de ${year}`,
  weekdays: {
    sunday: 'D',
    monday: 'S',
    tuesday: 'T',
    wednesday: 'Q',
    thursday: 'Q',
    friday: 'S',
    saturday: 'S',
  },
} as const
