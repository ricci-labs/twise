export const accountsMessages = {
  pageTitle: 'Contas e categorias',
  title: 'Contas e categorias',
  trash: 'Lixeira de contas',
  tabs: {
    label: 'Contas e categorias',
    accounts: 'Contas',
    categories: 'Categorias',
  },
  summary: {
    money: {
      label: 'Total em dinheiro',
      count: (count: number) => (count === 1 ? '1 conta' : `${count} contas`),
      foot: 'Cartões ficam de fora.',
    },
    cards: {
      label: 'Em aberto nos cartões',
      count: (count: number) => (count === 1 ? '1 cartão' : `${count} cartões`),
      foot: 'Inclui as parcelas futuras.',
    },
    nextInvoice: {
      label: 'Próxima fatura',
      foot: (due: string, closing: string) => `Vence em ${due} · fecha ${closing}`,
      none: 'Nenhuma fatura a pagar.',
    },
  },
  groups: {
    money: 'Dinheiro',
    cards: 'Cartões',
    cardsNote: 'Nos cartões, o total em aberto inclui as parcelas futuras.',
  },
  kinds: {
    checking: 'Conta corrente',
    savings: 'Poupança',
    cash_wallet: 'Carteira (dinheiro)',
    investment: 'Investimento',
    credit_card: 'Cartão de crédito',
  },
  household: 'da casa',
  cardDetail: (closing: string, due: string) => `Em aberto · fecha ${closing} · vence ${due}`,
  detail: (kind: string, owner: string) => `${kind} · ${owner}`,
  actions: {
    trigger: (name: string) => `Ações de ${name}`,
    archive: 'Arquivar',
    unarchive: 'Desarquivar',
    delete: 'Excluir',
  },
  toasts: {
    archived: (name: string, isCard: boolean) => `${name} ${isCard ? 'arquivado' : 'arquivada'}.`,
    unarchived: (name: string, isCard: boolean) =>
      `${name} ${isCard ? 'desarquivado' : 'desarquivada'}.`,
    deleted: (isCard: boolean) => (isCard ? 'Cartão excluído.' : 'Conta excluída.'),
    undo: 'Desfazer',
  },
  refusedDelete: {
    title: (name: string) => `Não dá para excluir a ${name}`,
    titleCard: (name: string) => `Não dá para excluir o ${name}`,
    text: 'Esta conta tem lançamentos ou subcategorias. Arquive em vez de excluir.',
    cancel: 'Cancelar',
    archive: 'Arquivar',
  },
  empty: {
    title: 'Nenhuma conta ainda.',
    text: 'Comece pela sua conta corrente. Depois, os cartões.',
  },
  failed: 'Não foi possível carregar as contas.',
} as const
