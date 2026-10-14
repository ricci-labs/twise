import { Button } from '@web/components/actions/button'
import { showToast } from '@web/components/feedback/toast/toast'
import type { ComponentExamples } from '@web/lib/examples.types'

export const toastExamples: ComponentExamples = {
  component: 'Toast',
  examples: [
    {
      name: 'Confirmação',
      render: () => (
        <Button variant="secondary" onClick={() => showToast('Enviamos de novo.')}>
          Mostrar toast
        </Button>
      ),
    },
    {
      name: 'Sucesso',
      render: () => (
        <Button
          variant="secondary"
          onClick={() => showToast('Lançamento registrado.', { tone: 'success' })}
        >
          Mostrar toast de sucesso
        </Button>
      ),
    },
    {
      name: 'Com "Desfazer"',
      render: () => (
        <Button
          variant="secondary"
          onClick={() =>
            showToast('Lançamento movido para a lixeira.', {
              action: { label: 'Desfazer', onPress: () => undefined },
            })
          }
        >
          Mostrar toast com ação
        </Button>
      ),
    },
  ],
}
