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
  updatedAt: (time: string) => `Atualizado às ${time}`,
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
  forecast: {
    title: 'Previsão de saldo',
    description: 'Do dia de hoje até o próximo salário, com o que já está previsto.',
    account: 'Conta',
    lowest: (amount: string, day: string) => `${amount} · ${day} · menor saldo do período`,
    today: (start: string, end: string, until: string) =>
      `Hoje ${start} · termina em ${end} em ${until}`,
    alternative: (account: string, start: string, end: string, lowest: string, lowestOn: string) =>
      `${account}: hoje ${start}, termina em ${end}, menor saldo ${lowest} em ${lowestOn}.`,
    seeAccounts: 'Ver contas',
    thousands: (value: number) => `R$ ${value} mil`,
    reais: (value: number) => `R$ ${value}`,
  },
  pace: {
    title: 'Ritmo do período',
    description: 'Quanto da renda já foi usada, comparado ao tempo que passou.',
    ofIncome: 'da renda',
    used: 'Renda já usada',
    elapsed: 'Período passado',
    ahead: (points: number) => `Vocês estão ${points} pontos à frente do ritmo.`,
    behind: (points: number) => `Vocês estão ${points} pontos atrás do ritmo.`,
    onPace: 'Vocês estão no ritmo.',
    alternative: (used: number, elapsed: number) =>
      `Renda já usada: ${used}%. Período passado: ${elapsed}%.`,
    closedTitle: 'Como o período terminou',
    closedDescription: (income: string) => `Renda do orçamento de ${income}.`,
    spent: 'Gasto',
    left: 'Sobrou',
    leftToReserve: 'O que sobrou pode ir para a reserva.',
  },
  budgets: {
    title: 'Orçamentos',
    description: 'Os 5 mais adiantados em relação ao ritmo do período.',
    of: (spent: string, limit: string) => `${spent} de ${limit}`,
    status: { over: 'Estourou', ahead: 'Adiantado', within: 'No ritmo' },
    paceNote: (percent: number) =>
      `Traço = onde o gasto deveria estar hoje (${percent}% do período).`,
    seeAll: 'Ver todos',
    empty: 'Defina orçamentos para acompanhar o ritmo dos gastos.',
    define: 'Definir orçamentos',
  },
  comingMonths: {
    title: 'Próximos meses',
    description: 'Quanto da renda fixa já está comprometido.',
    installments: 'Parcelas',
    planned: 'Contas previstas',
    limit: (percent: number) => `${percent}% da renda fixa`,
    high: (month: string, percent: number) =>
      `${month} já tem ${percent}% da renda fixa comprometida.`,
    calm: 'Nenhum mês passa de 70% da renda fixa.',
  },
  incomeSplit: {
    title: 'Para onde vai a renda',
    description: (income: string) => `Renda do orçamento de ${income} neste período.`,
    spent: 'Gasto',
    committed: 'Comprometido',
    free: 'Livre',
    commissionApart: (amount: string) => `A comissão de ${amount} fica fora desta conta.`,
  },
  invoices: {
    title: 'Próximas faturas',
    description: 'Já lançado mais o previsto de assinaturas.',
    dates: (closes: string, due: string) => `Fecha ${closes} · vence ${due}`,
    parts: (posted: string, planned: string) => `${posted} lançado · ${planned} previsto`,
    fronted: (amount: string) => `${amount} são de outras pessoas`,
    allYours: 'Tudo de vocês',
    seeCards: 'Ver cartões',
  },
  reserve: {
    title: 'Reserva e metas',
    description: 'A reserva vem primeiro; depois, as metas com prazo.',
    of: (saved: string, target: string) => `${saved} de ${target}`,
    covers: (months: string) => `Cobre ${months} meses de gastos`,
    noHistory: 'Cobre — meses de gastos',
    reserveAlternative: (percent: number, saved: string, target: string) =>
      `Reserva: ${percent}%, ${saved} de ${target}.`,
    goal: (percent: number, until: string) => `${percent}% · até ${until}`,
    seeGoals: 'Ver metas',
    empty:
      'Crie uma meta de reserva e metas com prazo, como uma viagem. A comissão pode ir direto para elas.',
    create: 'Criar meta',
  },
  commissions: {
    title: 'Comissões',
    description: 'Renda variável deste período.',
    thisPeriod: 'Este período',
    average: 'Média dos últimos meses',
    above: (percent: number) => `+${percent}% acima da média`,
    below: (percent: number) => `${percent}% abaixo da média`,
    split: 'Dividir',
  },
  receivables: {
    title: 'A receber de contatos',
    description: 'De quem usa os cartões de vocês.',
    from: (count: number) => `de ${count} ${plural(count, 'contato', 'contatos')}`,
    overdue: (amount: string) => `${amount} em atraso`,
    next: 'Próximo a receber: **{contact}**, {amount} em {day}',
    charge: 'Cobrar',
    seeContacts: 'Ver contatos',
  },
  achievements: {
    title: (month: string) => `Conquistas de ${month}`,
    description: 'O que deu certo neste período.',
    closedPositive: (month: string) => `Fecharam ${month} no azul`,
    left: 'Sobrou',
    streak: (months: number, isCapped: boolean) =>
      isCapped ? `${months}+ meses seguidos` : `${months}º mês seguido`,
    budgets: (within: number, total: number) => `${within} de ${total}`,
    budgetsLabel: 'orçamentos dentro do limite',
    bills: (onTime: number, total: number) => `${onTime} de ${total}`,
    billsLabel: 'contas pagas em dia',
    reserve: (amount: string) => `+${amount}`,
    reserveLabel: (months: string | null) =>
      months ? `na reserva, que agora cobre ${months} meses` : 'na reserva',
    goal: (start: number, end: number) => `${start}% → ${end}%`,
    goalLabel: (name: string) => `da meta ${name}`,
  },
  firstRun: {
    welcome: (workspace: string) => `Bem-vindos ao ${workspace}`,
    title: 'Vamos montar o mês de vocês',
    text: 'Em 4 passos a Início passa a mostrar quanto ainda dá para gastar, o que vai vencer e como estão os próximos meses.',
    progress: (done: number, total: number) => `${done} de ${total} feitos`,
    stepsTitle: 'Passo a passo',
    stepsText: 'Pode fazer na ordem que preferir; a gente marca o próximo.',
    next: 'Próximo passo',
    done: 'Feito',
    steps: {
      accounts: {
        title: 'Cadastre suas contas',
        text: 'Conta corrente, poupança e carteira. É daqui que sai a previsão de saldo.',
        action: 'Cadastrar conta',
        start: 'Começar pelas contas',
      },
      cards: {
        title: 'Cadastre seus cartões',
        text: 'Para acompanhar faturas, parcelas e quem usa cada cartão.',
        action: 'Cadastrar cartão',
        start: 'Continuar pelos cartões',
      },
      income: {
        title: 'Cadastre salário e contas fixas',
        text: 'Assim o Twise sabe o que entra e o que ainda vai vencer.',
        action: 'Cadastrar salário',
        start: 'Continuar pelo salário',
      },
      entries: {
        title: 'Registre os primeiros gastos',
        text: 'A partir daqui o "Livre para gastar" começa a aparecer.',
        action: 'Registrar gasto',
        start: 'Registrar o primeiro gasto',
      },
    },
    invite: {
      title: 'Convide quem divide com você',
      text: 'Quem divide com você vê e registra junto, no mesmo espaço.',
      action: 'Convidar',
    },
    previewTitle: 'O que vai aparecer aqui',
    previewText: 'A Início se enche de números conforme vocês avançam.',
    previewValue: 'R$ —',
    afterStep: (step: number) => `Depois do passo ${step}`,
    preview: {
      free: 'Livre para gastar',
      income: 'Renda do orçamento',
      spent: 'Gasto',
      committed: 'Comprometido',
    },
  },
  unnamed: '—',
} as const
