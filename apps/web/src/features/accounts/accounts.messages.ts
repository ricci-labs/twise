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
    newAccount: 'Nova conta',
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
    edit: 'Editar',
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
    action: 'Nova conta',
  },
  form: {
    newTitle: 'Nova conta',
    editTitle: 'Editar conta',
    close: 'Cancelar',
    requiredMark: '*',
    requiredLegend: 'obrigatório',
    kind: 'Tipo',
    kindHelp: 'O tipo não pode ser mudado depois.',
    name: 'Nome',
    namePlaceholder: 'Ex.: Conta do banco',
    owner: 'De quem é',
    household: 'Da casa',
    illustration: 'Ilustração',
    color: 'Cor',
    colorHelp: 'Aparece nos gráficos e ao lado do nome.',
    create: 'Criar conta',
    creating: 'Criando conta…',
    save: 'Salvar',
    saving: 'Salvando…',
    cancel: 'Cancelar',
    created: (name: string) => `${name} criada.`,
    saved: 'Alterações salvas.',
    failed: 'Não foi possível salvar a conta. Código: {ref}.',
    offline: 'Sem conexão. O que você digitou fica aqui; salve quando a conexão voltar.',
    required: {
      name: 'Informe o nome da conta.',
    },
    discard: {
      title: 'Descartar as alterações?',
      text: 'O que você preencheu nesta conta vai se perder.',
      keep: 'Continuar editando',
      confirm: 'Descartar',
    },
  },
  failed: 'Não foi possível carregar as contas.',
  categories: {
    kinds: {
      label: 'Tipo de categoria',
      expense: 'Despesas',
      income: 'Receitas',
    },
    groups: {
      expense: 'Categorias de despesa',
      income: 'Categorias de receita',
    },
    incomeNote:
      'A renda fixa (salário) é a que o orçamento usa; a variável (comissão) entra na divisão da comissão.',
    nature: {
      fixed: 'Fixa',
      variable: 'Variável',
    },
    kindNames: {
      expense: 'Categoria de despesa',
      income: 'Categoria de receita',
    },
    withChildren: (kind: string, names: string) => `${kind} · com ${names}`,
    loneChild: (parent: string) => `Subcategoria · em ${parent}`,
    chip: (name: string, parent: string) => `${name}, subcategoria de ${parent}: ações`,
    subcategoryOf: (parent: string) => `Subcategoria de ${parent}`,
    move: 'Mover para outra categoria',
    toasts: {
      archived: (name: string) => `${name} arquivada.`,
      archivedWithChildren: (name: string, count: number) =>
        `${name} e ${count === 1 ? '1 subcategoria' : `${count} subcategorias`} arquivadas.`,
      unarchived: (name: string) => `${name} desarquivada.`,
      deleted: (name: string) => `${name} excluída.`,
      moved: (name: string, parent: string) => `${name} agora está em ${parent}.`,
      madeMain: (name: string) => `${name} agora é uma categoria principal.`,
      parentArchived: (parent: string) =>
        `${parent} está arquivada. Desarquive ${parent} primeiro.`,
      unarchiveParent: (parent: string) => `Desarquivar ${parent}`,
    },
    refused: {
      title: (name: string) => `Não dá para excluir ${name}`,
      hasEntries: (name: string) =>
        `${name} tem lançamentos. Arquive em vez de excluir: ela sai das escolhas e o histórico continua.`,
      oneChild: (name: string, child: string) =>
        `${name} tem 1 subcategoria: ${child}. Mova ou exclua ${child} antes, ou arquive ${name} com ela.`,
      fewChildren: (name: string, list: string, all: string) =>
        `${name} tem ${list}. Mova ou exclua ${all} antes, ou arquive ${name} com elas.`,
      archive: 'Arquivar',
      archiveAll: (count: number) => `Arquivar as ${count}`,
      cancel: 'Cancelar',
    },
    childrenList: (count: number, names: string) => `${count} subcategorias: ${names}`,
    manyChildrenList: (count: number, first: string, second: string) =>
      `${count} subcategorias, como ${first} e ${second}`,
    allOf: (count: number) => {
      const words: Readonly<Record<number, string>> = { 2: 'as duas', 3: 'as três' }
      return words[count] ?? `as ${count}`
    },
    moveSheet: {
      title: (name: string) => `Mover ${name} para`,
      subtitle: (kind: string, name: string) =>
        `Só categorias principais de ${kind}. Os lançamentos de ${name} vão junto.`,
      kindNames: { expense: 'despesa', income: 'receita' },
      none: 'Nenhuma',
      noneDetail: (name: string) => `${name} vira uma categoria principal`,
      current: 'atual',
    },
    empty: {
      expense: 'Nenhuma categoria de despesa ainda.',
      income: 'Nenhuma categoria de receita ainda.',
    },
    failed: 'Não foi possível carregar as categorias.',
    and: ' e ',
  },
  trashPage: {
    pageTitle: 'Lixeira de contas',
    title: 'Lixeira de contas',
    description: 'Contas, cartões e categorias excluídos. Restaurar traz de volta com o histórico.',
    back: 'Voltar para Contas',
    kinds: {
      expense_category: 'Categoria de despesa',
      income_category: 'Categoria de receita',
    },
    inside: (kind: string, parent: string) => `${kind} · dentro de ${parent}`,
    deleted: (date: string, isMasculine: boolean) =>
      `${isMasculine ? 'Excluído' : 'Excluída'} em ${date}`,
    deletedBy: (deleted: string, name: string) => `${deleted} por ${name}`,
    reason: (reason: string) => `Motivo: ${reason}`,
    restore: 'Restaurar',
    restoreLabel: (name: string) => `Restaurar ${name}`,
    restored: {
      account: 'Conta restaurada.',
      card: 'Cartão restaurado.',
      category: 'Categoria restaurada.',
    },
    see: 'Ver',
    parentInTrash: (parent: string, isCategory: boolean) =>
      `${parent}, a ${isCategory ? 'categoria' : 'conta'} mãe, está na lixeira.`,
    restoreBoth: 'Restaurar as duas',
    nameTaken: 'Já existe outra conta com esse nome. Renomeie a outra e tente de novo.',
    empty: 'A lixeira está vazia.',
    failed: 'Não foi possível carregar a lixeira.',
  },
} as const
