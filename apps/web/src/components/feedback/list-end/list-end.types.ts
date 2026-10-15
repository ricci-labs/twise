import type { ReactElement } from 'react'

export type ListEndProps = {
  message: string
  previous?: {
    label: string
    link: ReactElement
  }
}
