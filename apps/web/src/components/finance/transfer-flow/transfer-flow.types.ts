export type TransferEnd = {
  name: string
  icon: string | null
}

export type TransferFlowProps = {
  from: TransferEnd
  to: TransferEnd
  fromLabel?: string
  toLabel?: string
  note?: string
}

export type TransferBoxProps = {
  end: TransferEnd
  label: string
}
