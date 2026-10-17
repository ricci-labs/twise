function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many
}

export const contactsMessages = {
  pageTitle: 'Contatos',
  title: 'Contatos',
  description: 'Quem divide compras com vocês e quanto cada um deve.',
  newContact: 'Novo contato',
  failed: 'Não foi possível carregar os contatos.',
  empty: {
    title: 'Nenhum contato ainda.',
    text: 'Contatos são pessoas que dividem compras com vocês: um amigo no jantar, a família na TV parcelada.',
  },
  summary: {
    label: 'Resumo dos contatos',
    owed: 'Total a receber',
    owedFrom: (count: number) => `de ${count} ${plural(count, 'contato', 'contatos')}`,
    overdue: 'Em atraso',
    overdueCount: (count: number) => `${count} ${plural(count, 'contato', 'contatos')}`,
  },
  sort: {
    label: 'Ordenar',
    overdue: 'Mais atrasados primeiro',
    name: 'Nome',
  },
  list: 'Contatos',
  archivedList: 'Contatos arquivados',
} as const
