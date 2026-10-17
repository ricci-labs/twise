export const untilChipsMessages = {
  label: 'Cobrar o que vence até',
  help: 'Escolha uma data futura para incluir as próximas parcelas.',
  today: (day: string) => `Hoje, ${day}`,
  next: (day: string, count: number) =>
    `Até ${day} · +${count} ${count === 1 ? 'parcela' : 'parcelas'}`,
  other: 'Outra data',
  picked: (day: string) => `Até ${day}`,
} as const
