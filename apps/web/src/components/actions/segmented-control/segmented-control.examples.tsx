import { SegmentedControl } from '@web/components/actions/segmented-control/segmented-control'
import type { ComponentExamples } from '@web/lib/examples.types'
import { useState } from 'react'

function AccountsExample() {
  const [value, setValue] = useState('x')
  return (
    <SegmentedControl
      label="Conta"
      options={[
        { value: 'x', label: 'Conta X' },
        { value: 'y', label: 'Conta Y' },
      ]}
      value={value}
      onValueChange={setValue}
    />
  )
}

export const segmentedControlExamples: ComponentExamples = {
  component: 'SegmentedControl',
  examples: [{ name: 'Contas', render: () => <AccountsExample /> }],
}
