import { Button } from '@web/components/actions/button'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog/confirm-dialog'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

function RefusedExample() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button variant="subtle" size="sm" onClick={() => setIsOpen(true)}>
        Excluir uma conta com lançamentos
      </Button>
      <ConfirmDialog
        title="Não dá para excluir a Conta Y"
        description="Esta conta tem lançamentos ou subcategorias. Arquive em vez de excluir."
        cancelLabel="Cancelar"
        confirmLabel="Arquivar"
        confirmVariant="primary"
        confirmIcon="archive"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onConfirm={() => setIsOpen(false)}
      />
    </>
  )
}

function Example() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button variant="subtle" size="sm" onClick={() => setIsOpen(true)}>
        Cancelar com alterações
      </Button>
      <ConfirmDialog
        title="Descartar as alterações?"
        description="O que você preencheu neste lançamento vai se perder."
        cancelLabel="Continuar editando"
        confirmLabel="Descartar"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onConfirm={() => setIsOpen(false)}
      />
    </>
  )
}

export const confirmDialogExamples: ComponentExamples = {
  component: 'ConfirmDialog',
  examples: [
    { name: 'Descartar as alterações', render: () => <Example /> },
    { name: 'Ação recusada, com a saída', render: () => <RefusedExample /> },
  ],
}
