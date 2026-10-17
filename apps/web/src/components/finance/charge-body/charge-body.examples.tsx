import { formatBrl } from '@financas/shared'
import { ChargeBody } from '@web/components/finance/charge-body/charge-body'
import type { ChargeAction } from '@web/components/finance/charge-body/charge-body.types'
import type { ComponentExamples } from '@web/lib/examples.types'

const MESSAGE = (
  <p className="m-0 rounded-md bg-mint-soft px-3.5 py-3 text-body-sm">
    {`Oi, Member D! Member A pediu para te lembrar do que está em aberto: Mercado da semana — ${formatBrl(12000)}; Jantar de aniversário — ${formatBrl(8000)}. Total: ${formatBrl(20000)}.`}
  </p>
)

const ITEMS = [
  { key: 'market', description: 'Mercado da semana', amountCents: 12000 },
  { key: 'dinner', description: 'Jantar de aniversário', amountCents: 8000 },
]

const ignore = () => undefined

function action(key: string, label: string, icon?: ChargeAction['icon']): ChargeAction {
  return { key, label, icon, onPress: ignore }
}

const COPY_PIX = action('pix', 'Copiar Pix', 'pix')

export const chargeBodyExamples: ComponentExamples = {
  component: 'ChargeBody',
  examples: [
    {
      name: 'Enviada por e-mail',
      render: () => (
        <div className="w-full max-w-90">
          <ChargeBody
            history={{
              kind: 'sent',
              send: {
                via: 'email',
                sentAt: '2026-10-20T17:32:00Z',
                sentTo: 'member.d@exemplo.com',
              },
            }}
            items={ITEMS}
            totalCents={20000}
            dueOn="2026-10-10"
            isDuePast
            message={MESSAGE}
            primaryAction={action('pay', 'Registrar pagamento', 'payment')}
            actions={[action('resend', 'Enviar de novo', 'send'), COPY_PIX]}
          />
        </div>
      ),
    },
    {
      name: 'O e-mail não saiu',
      render: () => (
        <div className="w-full max-w-90">
          <ChargeBody
            history={{ kind: 'emailFailed', sentTo: 'member.d@exemplo.com' }}
            items={ITEMS}
            totalCents={20000}
            dueOn="2026-10-10"
            isDuePast
            message={MESSAGE}
            primaryAction={action('retry', 'Tentar o e-mail de novo', 'retry')}
            actions={[
              action('whatsapp', 'Pelo WhatsApp', 'whatsapp'),
              action('fix', 'Corrigir e-mail', 'edit'),
            ]}
          />
        </div>
      ),
    },
    {
      name: 'Paga em parte',
      render: () => (
        <div className="w-full max-w-90">
          <ChargeBody
            history={{
              kind: 'sent',
              send: { via: 'email', sentAt: '2026-10-20T17:32:00Z' },
              receipt: {
                receivedCents: 12000,
                receivedOn: '2026-10-20',
                accountName: 'Conta X',
                leftCents: 8000,
              },
            }}
            items={ITEMS}
            totalCents={20000}
            dueOn="2026-10-10"
            isDuePast
            message={MESSAGE}
            isMessageOpen={false}
            primaryAction={action('pay', 'Registrar pagamento', 'payment')}
            actions={[action('resend', 'Enviar de novo', 'send'), COPY_PIX]}
          />
        </div>
      ),
    },
    {
      name: 'Leitor',
      render: () => (
        <div className="w-full max-w-90">
          <ChargeBody
            history={{
              kind: 'sent',
              send: {
                via: 'whatsapp',
                sentAt: '2026-10-20T13:05:00Z',
                sentTo: '+55 11 99999-0004',
              },
            }}
            items={ITEMS}
            totalCents={20000}
            dueOn="2026-10-10"
            isDuePast
            message={MESSAGE}
            actions={[action('message', 'Copiar mensagem'), action('pix', 'Copiar Pix')]}
          />
        </div>
      ),
    },
    {
      name: 'Texto longo no celular',
      render: () => (
        <div className="w-80">
          <ChargeBody
            history={{
              kind: 'sent',
              send: {
                via: 'email',
                sentAt: '2026-10-20T17:32:00Z',
                sentTo: 'maria.aparecida.dos.santos.oliveira@exemplo.com',
              },
            }}
            items={[
              {
                key: 'reform',
                description: 'Reforma do apartamento da praia com a família toda (parcela 12/12)',
                amountCents: 125652000,
              },
            ]}
            totalCents={125652000}
            dueOn="2026-11-10"
            message={MESSAGE}
            isMessageOpen={false}
            primaryAction={action('pay', 'Registrar pagamento', 'payment')}
            actions={[action('resend', 'Enviar de novo', 'send'), COPY_PIX]}
          />
        </div>
      ),
    },
  ],
}
