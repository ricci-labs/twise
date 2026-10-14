import type { ReactNode } from 'react'
import type { FieldPath, FieldValues, RefCallBack } from 'react-hook-form'

export type FieldControlProps = {
  id: string
  name: string
  value: string
  ref: RefCallBack
  onChange: (event: { target: { value: string } }) => void
  onBlur: () => void
  readOnly: boolean
  required: boolean
  maxLength?: number
  'aria-invalid'?: true
  'aria-describedby'?: string
}

export type FormFieldProps<Values extends FieldValues> = {
  name: FieldPath<Values>
  label: string
  help?: string
  helpGap?: 'tight' | 'roomy'
  warning?: string
  isRequired?: boolean
  isReadOnly?: boolean
  maxLength?: number
  children: (control: FieldControlProps) => ReactNode
}

export type FieldLabelProps = {
  htmlFor: string
  label: string
  isRequired: boolean
}

export type FieldWarningProps = {
  id: string
  message: string | undefined
}

export type FieldErrorProps = {
  id: string
  message: string | undefined
}
