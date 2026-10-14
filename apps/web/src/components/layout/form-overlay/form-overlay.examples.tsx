import { Button } from '@web/components/actions/button'
import { FormOverlay } from '@web/components/layout/form-overlay/form-overlay'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

function Example() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button variant="subtle" size="sm" onClick={() => setIsOpen(true)}>
        Abrir o formulário
      </Button>
      <FormOverlay
        title="Novo lançamento"
        closeLabel="Cancelar"
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        footer={
          <Button width="full" onClick={() => setIsOpen(false)}>
            Salvar lançamento
          </Button>
        }
      >
        <p className="px-4 pt-4 text-body lg:px-8">Os campos do formulário ficam aqui.</p>
      </FormOverlay>
    </>
  )
}

export const formOverlayExamples: ComponentExamples = {
  component: 'FormOverlay',
  examples: [{ name: 'Tela cheia no celular, diálogo no desktop', render: () => <Example /> }],
}
