const PLURAL = new Intl.PluralRules('pt-BR')

function plural(count: number, one: string, many: string): string {
  return PLURAL.select(count) === 'one' ? one : many
}

export const homeMessages = {
  pageTitle: 'Início',
  greeting: {
    morning: (name: string) => `Bom dia, ${name}`,
    afternoon: (name: string) => `Boa tarde, ${name}`,
    evening: (name: string) => `Boa noite, ${name}`,
  },
  today: (day: string, left: number) =>
    left > 0
      ? `Hoje é ${day} · faltam ${left} ${plural(left, 'dia', 'dias')} para o fim do período`
      : `Hoje é ${day}`,
  period: {
    label: 'Período',
    previous: 'Período anterior',
    next: 'Próximo período',
    closed: 'Período encerrado',
    future: 'Período futuro',
    backToCurrent: 'Ir para o período atual',
  },
  kpis: {
    free: {
      label: 'Livre para gastar',
      help: 'Renda fixa do período, menos o que já foi gasto, menos as contas que ainda vão vencer.',
      perDay: (amount: string) => `${amount} por dia`,
      until: (end: string, left: number) =>
        `Até ${end} · faltam ${left} ${plural(left, 'dia', 'dias')}`,
      closedLabel: 'Sobrou no período encerrado',
      over: 'Passou do planejado',
      overReason: 'Os gastos e as contas deste período já passaram da renda.',
      adjust: 'Ver onde ajustar',
    },
    income: {
      label: 'Renda do orçamento',
      help: 'Salários recebidos e previstos no período.',
      commission: (amount: string) => `Comissão à parte: ${amount}`,
    },
    spent: {
      label: 'Gasto',
      help: 'Despesas e parcelas que caem neste período.',
      average: (amount: string) => `Média mensal (3 meses): ${amount}`,
    },
    committed: {
      label: 'Comprometido',
      help: 'Contas fixas previstas que ainda não foram pagas, incluindo atrasadas.',
      bills: (count: number) =>
        `${count} ${plural(count, 'conta vence', 'contas vencem')} nos próximos 7 dias`,
      nothingLeft: 'Nada ficou para vencer',
    },
    ofIncome: (percent: number) => `${percent}% da renda`,
  },
  canIBuy: {
    title: 'Posso comprar?',
    text: 'Veja o impacto de uma compra nos próximos meses.',
  },
  insights: {
    title: 'Avisos',
    description: 'Os mais urgentes primeiro.',
    seeAll: (count: number) => `Ver todos os ${count} avisos`,
    seeFewer: 'Ver menos',
    calm: 'Tudo em ordem por aqui.',
    calmDetail: 'Quando algo precisar da atenção de vocês, aparece aqui primeiro.',
    failed: 'Não foi possível carregar os avisos.',
    sentences: {
      period_overspent:
        'Os gastos e as contas deste período já passaram da renda em **{overspent}**.',
      budget_over: '**{category}** estourou o orçamento: **{spent}** de **{limit}**.',
      balance_going_negative:
        'O saldo de **{account}** deve ficar negativo: **{lowest}** em {lowestOn}.',
      occurrence_overdue_expense:
        '**{description}** venceu em {dueOn} (**{amount}**) e ainda não foi registrada.',
      occurrence_overdue_income:
        '**{description}** era esperada em {dueOn} (**{amount}**) e ainda não entrou.',
      budget_ahead:
        '**{category}** está gastando acima do ritmo: **{spent}** até agora, o esperado era **{expected}**.',
      period_heavily_committed:
        '**{month}** já tem {percent}% da renda fixa comprometida (**{committed}**).',
      contact_overdue: '**{contact}** está com **{overdue}** em atraso.',
      variable_income_to_split: 'Ainda há **{amount}** de comissão para dividir neste período.',
    },
    actions: {
      seeEntries: 'Ver gastos',
      seeBudget: 'Ver orçamento',
      seeForecast: 'Ver previsão',
      record: 'Registrar',
      seeComingMonths: 'Ver próximos meses',
      charge: 'Cobrar',
      seeSuggestion: 'Ver sugestão',
    },
  },
  billsDue: {
    title: 'Vencem nos próximos 7 dias',
    summary: (count: number, total: string, until: string, overdue: number) =>
      `${count} ${plural(count, 'conta', 'contas')} · ${total} até ${until}${
        overdue > 0 ? `, e ${overdue} ${plural(overdue, 'atrasada', 'atrasadas')}` : ''
      }.`,
    late: (days: number) => `Atrasada há ${days} ${plural(days, 'dia', 'dias')}`,
    today: 'Vence hoje',
    inDays: (weekday: string, days: number) =>
      `${weekday} · ${days === 1 ? 'amanhã' : `em ${days} dias`}`,
    record: 'Registrar',
    empty: 'Nenhuma conta vence nos próximos 7 dias.',
    seeAll: 'Ver contas fixas',
    failed: 'Não foi possível carregar as contas que vencem.',
  },
  unnamed: '—',
} as const
