export const categoryRowMessages = {
  count: (count: number) => (count === 1 ? '1 subcategoria' : `${count} subcategorias`),
  show: (name: string) => `Mostrar as subcategorias de ${name}`,
  hide: (name: string) => `Recolher as subcategorias de ${name}`,
} as const
