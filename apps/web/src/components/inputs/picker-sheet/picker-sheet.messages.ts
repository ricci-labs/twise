export const pickerSheetMessages = {
  nothingFound: 'Nada encontrado com essa busca.',
  close: 'Fechar',
  subcategoryCount: (count: number) => `${count} sub`,
  within: (parent: string) => `Em ${parent}`,
  onlyParent: (parent: string) => `Só ${parent}`,
  childOf: (parent: string) => `em ${parent}`,
} as const
