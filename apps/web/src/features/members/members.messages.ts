export const membersMessages = {
  pageTitle: 'Membros',
  title: 'Membros',
  people: (count: number) => (count === 1 ? '1 pessoa' : `${count} pessoas`),
  ownersRule:
    'Só um dono dá o papel de dono ou muda outro dono. O espaço sempre precisa de pelo menos um dono.',
  failed: 'Não foi possível carregar os membros.',
} as const
