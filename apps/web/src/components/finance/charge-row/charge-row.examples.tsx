import { formatBrl } from '@financas/shared'
import type { ItemAction } from '@web/components/actions/item-actions'
import { ChargeBody } from '@web/components/finance/charge-body'
import { ChargeRow } from '@web/components/finance/charge-row/charge-row'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

const ignore = () => undefined

const MENU: readonly ItemAction[] = [
  { key: 'message', label: 'Copiar mensagem', icon: 'list', onSelect: ignore },
  { key: 'receipt', label: 'Anexar comprovante', icon: 'plus', onSelect: ignore },
  { key: 'cancel', label: 'Cancelar cobrança', icon: 'trash', tone: 'danger', onSelect: ignore },
]

const MESSAGE = (
  <p className="m-0 rounded-md bg-mint-soft px-3.5 py-3 text-body-sm">
    {`Oi, Member D! Member A pediu para te lembrar do que está em aberto. Total: ${formatBrl(20000)}.`}
  </p>
)

const LIST = 'w-full max-w-90 rounded-lg border border-border bg-surface px-3.5'

function OpenCharge() {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <ChargeRow
      createdOn="2026-10-20"
      amountCents={20000}
      status="sent"
      itemCount={2}
      sentVia="email"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      actions={MENU}
    >
      <ChargeBody
        history={{
          kind: 'sent',
          send: { via: 'email', sentAt: '2026-10-20T17:32:00Z', sentTo: 'member.d@exemplo.com' },
        }}
        items={[
          { key: 'market', description: 'Mercado da semana', amountCents: 12000 },
          { key: 'dinner', description: 'Jantar de aniversário', amountCents: 8000 },
        ]}
        totalCents={20000}
        dueOn="2026-10-10"
        isDuePast
        message={MESSAGE}
        primaryAction={{
          key: 'pay',
          label: 'Registrar pagamento',
          icon: 'payment',
          onPress: ignore,
        }}
        actions={[
          { key: 'resend', label: 'Enviar de novo', icon: 'send', onPress: ignore },
          { key: 'pix', label: 'Copiar Pix', icon: 'pix', onPress: ignore },
        ]}
      />
    </ChargeRow>
  )
}

export const chargeRowExamples: ComponentExamples = {
  component: 'ChargeRow',
  examples: [
    {
      name: 'Aberta, com o ⋯, e fechada',
      render: () => (
        <ul className={LIST}>
          <OpenCharge />
          <ChargeRow
            createdOn="2026-09-12"
            amountCents={16000}
            status="paid"
            itemCount={1}
            sentVia="whatsapp"
            isOpen={false}
            onOpenChange={ignore}
            actions={MENU}
          />
        </ul>
      ),
    },
    {
      name: 'Cada situação',
      render: () => (
        <ul className={LIST}>
          <ChargeRow
            createdOn="2026-10-20"
            amountCents={20000}
            status="draft"
            itemCount={2}
            sentVia="email"
            hasEmailFailed
            isOpen={false}
            onOpenChange={ignore}
          />
          <ChargeRow
            createdOn="2026-10-18"
            amountCents={20000}
            status="sent"
            itemCount={2}
            sentVia="manual"
            isOpen={false}
            onOpenChange={ignore}
          />
          <ChargeRow
            createdOn="2026-10-15"
            amountCents={20000}
            status="partially_paid"
            itemCount={2}
            sentVia="email"
            isOpen={false}
            onOpenChange={ignore}
          />
          <ChargeRow
            createdOn="2026-09-12"
            amountCents={16000}
            status="paid"
            itemCount={1}
            sentVia="whatsapp"
            isOpen={false}
            onOpenChange={ignore}
          />
          <ChargeRow
            createdOn="2026-09-01"
            amountCents={4000}
            status="cancelled"
            itemCount={1}
            isOpen={false}
            onOpenChange={ignore}
          />
        </ul>
      ),
    },
    {
      name: 'Valor longo no celular',
      render: () => (
        <ul className="w-80 rounded-lg border border-border bg-surface px-3.5">
          <ChargeRow
            createdOn="2026-10-20"
            amountCents={125652000}
            status="partially_paid"
            itemCount={12}
            sentVia="email"
            hasEmailFailed
            isOpen
            onOpenChange={ignore}
            actions={MENU}
          />
        </ul>
      ),
    },
  ],
}
