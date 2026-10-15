export const categoryRowMessages = {
  count: (count: number) => (count === 1 ? '1 subcategoria' : `${count} subcategorias`),
  show: (count: string, name: string) => `Mostrar ${count} de ${name}`,
  hide: (count: string, name: string) => `Recolher ${count} de ${name}`,
} as const
