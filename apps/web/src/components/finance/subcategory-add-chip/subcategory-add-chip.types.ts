import type { ReactElement, ReactNode } from 'react'

export type AddChipLinkProps = {
  className?: string
  'aria-label'?: string
  children?: ReactNode
}

export type SubcategoryAddChipProps = {
  label: string
  link: ReactElement<AddChipLinkProps>
}
