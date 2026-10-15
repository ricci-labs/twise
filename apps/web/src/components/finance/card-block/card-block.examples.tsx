import { CardBlock } from '@web/components/finance/card-block/card-block'
import type { ComponentExamples } from '@web/lib/examples.types'
import { ACCOUNT_COLORS } from '@web/styles/account-colors'

export const cardBlockExamples: ComponentExamples = {
  component: 'CardBlock',
  examples: [
    {
      name: 'Com limite',
      render: () => (
        <div className="w-full max-w-90">
          <CardBlock
            name="Cartão X"
            icon="card"
            color={ACCOUNT_COLORS[7].value}
            cycle="Fecha dia 25 · vence dia 4 · Member A"
            link={<a href="#cartao" />}
            invoice={{
              label: 'Fatura aberta',
              amountCents: 195000,
              due: 'vence 04/11',
              link: <a href="#fatura">fatura</a>,
            }}
            limit={{ label: 'Limite de R$ 6.000,00', used: '48% usado', percent: 48 }}
            open="Em aberto no cartão: R$ 2.890,00, com as parcelas futuras"
            bestDay={{ label: 'Melhor dia de compra:', value: 'dia 25' }}
          />
        </div>
      ),
    },
    {
      name: 'Sem limite',
      render: () => (
        <div className="w-full max-w-90">
          <CardBlock
            name="Cartão Y"
            icon="card"
            color={null}
            cycle="Fecha dia 2 · vence dia 10"
            link={<a href="#cartao" />}
            invoice={{
              label: 'Fatura aberta',
              amountCents: 62000,
              due: 'vence 10/11',
              link: <a href="#fatura">fatura</a>,
            }}
            open="Em aberto no cartão: R$ 620,00, com as parcelas futuras"
            bestDay={{ label: 'Melhor dia de compra:', value: 'dia 2' }}
          />
        </div>
      ),
    },
    {
      name: 'Texto longo no celular',
      render: () => (
        <div className="w-80">
          <CardBlock
            name="Cartão Conjunto do Banco Exemplo Platinum"
            icon="card"
            color={ACCOUNT_COLORS[7].value}
            cycle="Fecha dia 25 · vence dia 4 · Fulana de Tal dos Santos Silva"
            link={<a href="#cartao" />}
            invoice={{
              label: 'Fatura aberta',
              amountCents: 123456789,
              due: 'vence 04/11',
              link: <a href="#fatura">fatura</a>,
            }}
            limit={{ label: 'Limite de R$ 2.000.000,00', used: '62% usado', percent: 62 }}
            open="Em aberto no cartão: R$ 1.234.567,89, com as parcelas futuras"
            bestDay={{ label: 'Melhor dia de compra:', value: 'dia 25' }}
          />
        </div>
      ),
    },
  ],
}
