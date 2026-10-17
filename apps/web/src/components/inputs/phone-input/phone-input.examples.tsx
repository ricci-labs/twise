import { PhoneInput } from '@web/components/inputs/phone-input/phone-input'
import type { PhoneInputExampleProps } from '@web/components/inputs/phone-input/phone-input.types'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useId, useState } from 'react'

function Example({
  initialCallingCode = '+55',
  initialNumber = '',
  isInvalid = false,
}: PhoneInputExampleProps) {
  const id = useId()
  const [callingCode, setCallingCode] = useState(initialCallingCode)
  const [number, setNumber] = useState(initialNumber)
  return (
    <div className="flex w-full max-w-100 flex-col gap-2">
      <label htmlFor={id} className="text-label text-ink">
        WhatsApp
      </label>
      <PhoneInput
        id={id}
        callingCode={callingCode}
        onCallingCodeChange={setCallingCode}
        value={number}
        onChange={(event) => setNumber(event.target.value)}
        aria-invalid={isInvalid || undefined}
      />
    </div>
  )
}

export const phoneInputExamples: ComponentExamples = {
  component: 'PhoneInput',
  examples: [
    { name: 'Vazio', render: () => <Example /> },
    { name: 'Preenchido', render: () => <Example initialNumber="(11) 99999-0000" /> },
    {
      name: 'Outro país',
      render: () => <Example initialCallingCode="+351" initialNumber="912345678" />,
    },
    { name: 'Com erro', render: () => <Example initialNumber="99999-0000" isInvalid /> },
  ],
}
