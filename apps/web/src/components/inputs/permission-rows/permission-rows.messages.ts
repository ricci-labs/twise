export const permissionRowsMessages = {
  actions: { view: 'Ver', create: 'Criar', update: 'Editar', delete: 'Excluir' },
  locked: 'Você não tem essa permissão para dar.',
  area: 'Área',
  none: '—',
  notInArea: 'Não existe nesta área',
  checkbox: (action: string, area: string) => `${action} em ${area}`,
} as const
