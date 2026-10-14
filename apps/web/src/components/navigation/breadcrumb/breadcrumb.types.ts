import type { ReactElement, ReactNode } from 'react'

export type BreadcrumbLinkProps = {
  className?: string
  children?: ReactNode
}

export type BreadcrumbItem = {
  label: string
  link?: ReactElement<BreadcrumbLinkProps>
}

export type BreadcrumbProps = {
  label: string
  items: readonly BreadcrumbItem[]
}
