import type { IsoDate } from '@financas/shared'
import { UntilChips } from '@web/components/finance/until-chips/until-chips'
import type { UntilNextDue } from '@web/components/finance/until-chips/until-chips.types'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

const TODAY: IsoDate = '2026-10-20'

function Example({ initial, next }: { initial: IsoDate; next?: UntilNextDue }) {
  const [value, setValue] = useState(initial)
  return (
    <div className="w-full max-w-100">
      <UntilChips today={TODAY} next={next} value={value} onChange={setValue} />
    </div>
  )
}

export const untilChipsExamples: ComponentExamples = {
  component: 'UntilChips',
  examples: [
    {
      name: 'Hoje, com a próxima parcela',
      render: () => <Example initial={TODAY} next={{ dueOn: '2026-11-10', installmentCount: 1 }} />,
    },
    {
      name: 'Até a próxima data, com duas parcelas',
      render: () => (
        <Example initial="2026-11-10" next={{ dueOn: '2026-11-10', installmentCount: 2 }} />
      ),
    },
    {
      name: 'Outra data escolhida no calendário',
      render: () => (
        <Example initial="2026-12-05" next={{ dueOn: '2026-11-10', installmentCount: 1 }} />
      ),
    },
    {
      name: 'Sem parcelas por vir',
      render: () => <Example initial={TODAY} />,
    },
  ],
}
