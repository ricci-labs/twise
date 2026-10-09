export const kpiCarouselMessages = {
  label: 'Indicadores do período',
  slide: (position: number, total: number) => `${position} de ${total}`,
  goTo: (position: number) => `Ir para o indicador ${position}`,
} as const
