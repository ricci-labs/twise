import { RecentEntries } from '@web/components/finance/recent-entries/recent-entries'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

const ENTRIES = [
  { key: 'groceries', description: 'Mercado da semana', icon: 'groceries', amountCents: 8640 },
  { key: 'uber', description: 'Uber', icon: 'transport', amountCents: 2390 },
  { key: 'rent', description: 'Aluguel', icon: 'house', amountCents: 180_000 },
  { key: 'bakery', description: 'Padaria', icon: 'groceries', amountCents: 1850 },
  {
    key: 'internet',
    description: 'Internet fibra 1 giga com TV e telefone',
    icon: 'house',
    amountCents: 123_456_789,
  },
]

function Example() {
  const [picked, setPicked] = useState<string | null>(null)
  return (
    <div className="w-full max-w-100">
      <RecentEntries entries={ENTRIES} pickedKey={picked} onPick={setPicked} />
    </div>
  )
}

export const recentEntriesExamples: ComponentExamples = {
  component: 'RecentEntries',
  examples: [{ name: 'Faixa que rola para o lado', render: () => <Example /> }],
}
