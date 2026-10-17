import { Button } from '@web/components/actions/button'
import { EmailSendSheet } from '@web/components/finance/email-send-sheet/email-send-sheet'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

function Example({
  label,
  hasPix,
  isSending,
}: {
  label: string
  hasPix: boolean
  isSending: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        {label}
      </Button>
      <EmailSendSheet
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        to="member.d@exemplo.com"
        subject="Member A te enviou uma cobrança de R$ 200,00"
        replyTo={{ name: 'Member A', email: 'member.a@exemplo.com' }}
        hasPix={hasPix}
        onPreview={() => undefined}
        onSend={() => setIsOpen(false)}
        isSending={isSending}
      />
    </>
  )
}

export const emailSendSheetExamples: ComponentExamples = {
  component: 'EmailSendSheet',
  examples: [
    {
      name: 'Confirmar o envio',
      render: () => <Example label="Enviar por e-mail" hasPix isSending={false} />,
    },
    {
      name: 'Sem Pix configurado',
      render: () => <Example label="Sem Pix configurado" hasPix={false} isSending={false} />,
    },
    {
      name: 'Enviando',
      render: () => <Example label="Enviando" hasPix isSending />,
    },
  ],
}
