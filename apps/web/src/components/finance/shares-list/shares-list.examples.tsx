import { SharesCollapsed, SharesList } from '@web/components/finance/shares-list/shares-list'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

function Example({ withError = false }: { withError?: boolean }) {
  const [rows, setRows] = useState([
    { key: 'c', contactName: 'Member C', amountText: withError ? '150,00' : '80,00' },
    { key: 'd', contactName: 'Member D', amountText: withError ? '120,00' : '80,00' },
  ])
  return (
    <div className="w-full max-w-100">
      <SharesList
        rows={rows.map((row) => ({ ...row, isInvalid: withError }))}
        yoursName="Member A"
        yoursCents={withError ? null : 8000}
        error={withError ? 'A soma das partes passa do valor total.' : undefined}
        canAdd
        onAmountChange={(key, change) =>
          setRows((current) =>
            current.map((row) =>
              row.key === key ? { ...row, amountText: change.target.value } : row,
            ),
          )
        }
        onRemove={(key) => setRows((current) => current.filter((row) => row.key !== key))}
        onAdd={() => undefined}
        onHalf={() => undefined}
        onEqually={() => undefined}
      />
    </div>
  )
}

export const sharesListExamples: ComponentExamples = {
  component: 'SharesList',
  examples: [
    { name: 'Fechada', render: () => <SharesCollapsed onOpen={() => undefined} /> },
    { name: 'Jantar de R$ 240,00 em três', render: () => <Example /> },
    { name: 'Soma passa do total', render: () => <Example withError /> },
  ],
}
