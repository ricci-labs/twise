export const membersMessages = {
  pageTitle: 'Membros',
  title: 'Membros',
  people: (count: number) => (count === 1 ? '1 pessoa' : `${count} pessoas`),
  ownersRule:
    'Só um dono dá o papel de dono ou muda outro dono. O espaço sempre precisa de pelo menos um dono.',
  failed: 'Não foi possível carregar os membros.',
  actions: {
    trigger: (name: string) => `Ações de ${name}`,
    remove: 'Remover do espaço',
    leave: 'Sair do espaço',
  },
  remove: {
    title: (name: string) => `Remover ${name} do espaço?`,
    text: 'A pessoa perde o acesso na hora. O que ela registrou continua no espaço.',
    reason: 'Motivo (opcional)',
    reasonPlaceholder: 'Fica no histórico',
    cancel: 'Cancelar',
    confirm: 'Remover',
    done: (name: string) => `${name} não faz mais parte do espaço.`,
  },
  leave: {
    title: (workspace: string) => `Sair do espaço ${workspace}?`,
    text: 'Você perde o acesso aos dados dele.',
    cancel: 'Cancelar',
    confirm: 'Sair do espaço',
    done: (workspace: string) => `Você saiu do espaço ${workspace}.`,
  },
  lastOwner: {
    title: (workspace: string) => `Você é o único dono do ${workspace}`,
    text: (name: string) =>
      `O espaço precisa de pelo menos um dono. Dê o papel de dono a ${name} antes de sair.`,
    alone:
      'O espaço precisa de pelo menos um dono. Convide outra pessoa e dê a ela o papel de dono antes de sair.',
    cancel: 'Cancelar',
    promote: (name: string) => `Tornar ${name} dono`,
    promoted: (name: string) => `${name} agora é dono do espaço.`,
  },
} as const
