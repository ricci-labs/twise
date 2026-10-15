import { TrashTabs } from '@web/components/navigation/trash-tabs/trash-tabs'
import type { TrashTab } from '@web/components/navigation/trash-tabs/trash-tabs.types'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

function Example() {
  const [tab, setTab] = useState<TrashTab>('entries')
  return (
    <div className="w-full max-w-90">
      <TrashTabs value={tab} onChange={setTab} />
    </div>
  )
}

export const trashTabsExamples: ComponentExamples = {
  component: 'TrashTabs',
  examples: [{ name: 'Lançamentos | Contas e categorias', render: () => <Example /> }],
}
