export const goalCardMessages = {
  keptIn: 'Guardado em {account}',
  reached: 'Meta atingida',
  of: 'de {target}',
  until: '{percent}% · até {deadline}',
  noDeadline: '{percent}% · sem prazo',
  left: 'faltam {amount}',
  over: 'Passou {amount}',
  done: 'Completa',
  monthly: 'Para chegar em {deadline}: **{amount} por mês**',
  reachedHint: 'Chegou lá. Pode concluir a meta ou aumentar o valor.',
  progress: (percent: number) => `${percent}% da meta`,
} as const
