import { ContactRow } from '@web/components/finance/contact-row/contact-row'
import type { ComponentExamples } from '@web/lib/examples.types'
import type { ReactNode } from 'react'

function List({ children }: { children: ReactNode }) {
  return (
    <ul className="w-full max-w-100 rounded-xl border border-border bg-surface px-3.5">
      {children}
    </ul>
  )
}

function noop() {}

export const contactRowExamples: ComponentExamples = {
  component: 'ContactRow',
  examples: [
    {
      name: 'Em atraso com Cobrar, próximo, sem mensagens e crédito',
      render: () => (
        <List>
          <ContactRow
            name="Member D"
            owedCents={52000}
            overdueCents={20000}
            overdueSince="2026-10-10"
            channels={['whatsapp', 'email']}
            link={<button type="button" />}
            onCharge={noop}
          />
          <ContactRow
            name="Member C"
            owedCents={12000}
            nextDueOn="2026-10-25"
            nextDueCents={12000}
            channels={['whatsapp']}
            link={<button type="button" />}
          />
          <ContactRow
            name="Member E"
            owedCents={20000}
            nextDueOn="2026-11-10"
            nextDueCents={20000}
            isOptedOut
            channels={['email']}
            link={<button type="button" />}
          />
          <ContactRow
            name="Member F"
            owedCents={-3000}
            channels={['whatsapp']}
            link={<button type="button" />}
          />
        </List>
      ),
    },
    {
      name: 'Depois de cobrar: "Cobrado em 20/10", sem Cobrar',
      render: () => (
        <List>
          <ContactRow
            name="Member D"
            owedCents={52000}
            overdueCents={20000}
            overdueSince="2026-10-10"
            chargedOn="2026-10-20"
            channels={['whatsapp', 'email']}
            link={<button type="button" />}
          />
        </List>
      ),
    },
    {
      name: 'Arquivado, em dia',
      render: () => (
        <List>
          <ContactRow
            name="Member G"
            owedCents={0}
            channels={['whatsapp']}
            isArchived
            link={<button type="button" />}
          />
        </List>
      ),
    },
    {
      name: 'Nome longo e valor de 7 dígitos',
      render: () => (
        <List>
          <ContactRow
            name="Maria Aparecida dos Santos Oliveira"
            owedCents={125652000}
            overdueCents={125652000}
            overdueSince="2026-10-10"
            isOptedOut
            channels={['whatsapp', 'email']}
            link={<button type="button" />}
            onCharge={noop}
          />
          <ContactRow
            name="Maria Aparecida dos Santos Oliveira"
            owedCents={-125652000}
            channels={['email']}
            link={<button type="button" />}
          />
        </List>
      ),
    },
  ],
}
