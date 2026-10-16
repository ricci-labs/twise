export const holidayRowMessages = {
  next: 'Próximo',
  date: (date: string) => `${date}: `,
  detail: (weekday: string, isWeekend: boolean) =>
    isWeekend ? `${weekday} · cai no fim de semana` : weekday,
} as const
