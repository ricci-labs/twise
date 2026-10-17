import { ActionGrid } from '@web/components/actions/action-grid/action-grid'
import { Button } from '@web/components/actions/button'
import type { ComponentExamples } from '@web/lib/examples.types'

export const actionGridExamples: ComponentExamples = {
  component: 'ActionGrid',
  examples: [
    {
      name: 'Principal e duas secundárias (no celular)',
      render: () => (
        <ActionGrid label="Ações da cobrança" className="w-full max-w-90">
          <Button>Registrar pagamento</Button>
          <Button variant="secondary">Enviar de novo</Button>
          <Button variant="secondary">Copiar Pix</Button>
        </ActionGrid>
      ),
    },
    {
      name: 'Principal e duas secundárias (container largo, uma linha)',
      render: () => (
        <ActionGrid label="Ações da cobrança" className="w-full max-w-160">
          <Button>Registrar pagamento</Button>
          <Button variant="secondary">Enviar de novo</Button>
          <Button variant="secondary">Copiar Pix</Button>
        </ActionGrid>
      ),
    },
    {
      name: 'Principal e uma secundária',
      render: () => (
        <ActionGrid label="Ações da fatura" className="w-full max-w-90">
          <Button>Pagar fatura</Button>
          <Button variant="secondary">Ver lançamentos</Button>
        </ActionGrid>
      ),
    },
    {
      name: 'Sem principal (leitor)',
      render: () => (
        <ActionGrid layout="even" label="Ações da cobrança" className="w-full max-w-90">
          <Button variant="secondary">Copiar mensagem</Button>
          <Button variant="secondary">Copiar Pix</Button>
        </ActionGrid>
      ),
    },
  ],
}
