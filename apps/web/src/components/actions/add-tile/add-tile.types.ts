import type { ReactElement, ReactNode } from 'react'

export type AddTileLinkProps = {
  className?: string
  children?: ReactNode
}

export type AddTileProps = {
  title: string
  text?: string
  link: ReactElement<AddTileLinkProps>
}
