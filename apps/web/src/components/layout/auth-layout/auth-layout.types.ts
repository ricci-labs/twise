import type { OwlSceneName } from '@web/components/brand/owl-scene'
import type { ReactNode } from 'react'

export type AuthLayoutProps = {
  scene: OwlSceneName
  title: string
  subtitle: string
  banner?: ReactNode
  notice?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
}

export type AuthMainProps = Pick<
  AuthLayoutProps,
  'title' | 'subtitle' | 'notice' | 'footer' | 'children'
>

export type AuthArtProps = {
  scene: OwlSceneName
}

export type AuthFrameProps = {
  banner?: ReactNode
  children: ReactNode
}

export type AuthFrameSlot = {
  show: (scene: OwlSceneName) => void
  hide: () => void
}
