export const nextHolidayCardMessages = {
  label: 'Próximo feriado',
  none: 'Nenhum feriado pela frente.',
  when: (weekday: string, daysAway: number) => {
    if (daysAway === 0) {
      return `${weekday} · hoje`
    }
    return daysAway === 1 ? `${weekday} · amanhã` : `${weekday} · daqui a ${daysAway} dias`
  },
  date: (date: string) => `, ${date}`,
  effect: (description: string, date: string) => `${description} passa para ${date}`,
  effects: (effects: readonly string[]) =>
    effects.length === 1
      ? `Muda 1 conta fixa: ${effects[0]}.`
      : `Muda ${effects.length} contas fixas: ${effects.join('; ')}.`,
} as const
