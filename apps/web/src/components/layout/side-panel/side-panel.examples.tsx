import { Button } from '@web/components/actions/button'
import { SidePanel } from '@web/components/layout/side-panel/side-panel'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

function Example() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        Abrir o painel
      </Button>
      {isOpen && (
        <SidePanel
          title="Lançamento"
          closeLabel="Fechar"
          onClose={() => setIsOpen(false)}
          actions={
            <Button variant="secondary" size="sm">
              Editar
            </Button>
          }
        >
          <p className="rounded-lg border border-border bg-surface p-4">Conteúdo do detalhe.</p>
        </SidePanel>
      )}
    </>
  )
}

export const sidePanelExamples: ComponentExamples = {
  component: 'SidePanel',
  examples: [{ name: 'Detalhe à direita, sobre a página', render: () => <Example /> }],
}
