export const roleCardMessages = {
  system: 'Sistema',
  custom: 'Do espaço',
  locked: 'Não pode ser alterado',
  nobody: 'Ninguém',
  people: (count: number) => (count === 1 ? '1 pessoa' : `${count} pessoas`),
  invitations: (count: number) => (count === 1 ? '1 convite' : `${count} convites`),
} as const
