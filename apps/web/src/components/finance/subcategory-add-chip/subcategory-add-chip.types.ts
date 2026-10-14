import type { ReactElement, ReactNode } from 'react'

export type AddChipLinkProps = {
  className?: string
  'aria-label'?: string
  children?: ReactNode
}

export type SubcategoryAddChipProps = {
  label: string
  text?: string
  link: ReactElement<AddChipLinkProps>
}
