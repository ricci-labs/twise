import { Button } from '@web/components/actions/button'
import { TextLink } from '@web/components/actions/text-link'
import {
  ContactChannelRow,
  ContactChannels,
} from '@web/components/finance/contact-channels/contact-channels'
import type { ComponentExamples } from '@web/lib/examples.types'
import { Copy, ExternalLink } from 'lucide-react'

export const contactChannelsExamples: ComponentExamples = {
  component: 'ContactChannels',
  examples: [
    {
      name: 'Falar com: WhatsApp, e-mail, chave Pix e observações',
      render: () => (
        <div className="w-full max-w-100">
          <ContactChannels>
            <ContactChannelRow
              kind="whatsapp"
              label="WhatsApp"
              value="+55 (11) 99999-0004"
              action={
                <Button variant="secondary" size="sm" render={<a href="#whatsapp" />}>
                  <ExternalLink aria-hidden="true" />
                  Abrir
                </Button>
              }
            />
            <ContactChannelRow kind="email" label="E-mail" value="member.d@exemplo.com" />
            <ContactChannelRow
              kind="pix"
              label="Chave Pix de Member D"
              value="member.d@exemplo.com"
              action={
                <Button variant="quiet" size="icon" aria-label="Copiar chave Pix">
                  <Copy aria-hidden="true" />
                </Button>
              }
            />
            <ContactChannelRow
              kind="notes"
              label="Observações"
              value="Divide a TV da sala e o mercado do mês."
              tone="note"
            />
          </ContactChannels>
        </div>
      ),
    },
    {
      name: 'Sem número, com um e-mail longo',
      render: () => (
        <div className="w-full max-w-90">
          <ContactChannels>
            <ContactChannelRow
              kind="whatsapp"
              label="WhatsApp"
              value="Sem número"
              tone="missing"
              action={<TextLink render={<button type="button" />}>Adicionar</TextLink>}
            />
            <ContactChannelRow
              kind="email"
              label="E-mail"
              value="maria.aparecida.dos.santos.oliveira@exemplo.com"
            />
          </ContactChannels>
        </div>
      ),
    },
  ],
}
