import { ListSummary } from '@web/components/display/list-summary/list-summary'
import type { ComponentExamples } from '@web/lib/examples.types'

export const listSummaryExamples: ComponentExamples = {
  component: 'ListSummary',
  examples: [
    {
      name: 'O período',
      render: () => <ListSummary outCents={650520} inCents={912000} count={11} />,
    },
    {
      name: 'Com filtros: só saídas',
      render: () => <ListSummary outCents={424000} inCents={0} count={3} />,
    },
    {
      name: 'Só transferências',
      render: () => <ListSummary outCents={0} inCents={0} count={1} />,
    },
  ],
}
