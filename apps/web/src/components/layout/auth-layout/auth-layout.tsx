import { Logo } from '@web/components/brand/logo'
import { OwlEntrance } from '@web/components/brand/owl-entrance'
import { type OwlKitName, preloadOwlKits } from '@web/components/brand/owl-kit'
import type { OwlSceneName } from '@web/components/brand/owl-scene'
import { authLayoutMessages } from '@web/components/layout/auth-layout/auth-layout.messages'
import type {
  AuthArtProps,
  AuthFrameProps,
  AuthFrameSlot,
  AuthLayoutProps,
  AuthMainProps,
} from '@web/components/layout/auth-layout/auth-layout.types'
import {
  authArtVariants,
  authClaimVariants,
  authColumnVariants,
  authFooterVariants,
  authGridVariants,
  authLayoutVariants,
  authMainVariants,
  authOwlVariants,
  authSubtitleVariants,
  authTitleVariants,
} from '@web/components/layout/auth-layout/auth-layout.variants'
import { useLightTheme } from '@web/hooks/use-light-theme'
import { cn } from '@web/lib/cn'
import { createContext, use, useEffect, useLayoutEffect, useState } from 'react'

const AUTH_ENTRANCES: readonly OwlKitName[] = [
  'entrance-welcome',
  'entrance-sign-up',
  'entrance-key',
  'entrance-offline',
  'entrance-wait',
]

const AuthFrameContext = createContext<AuthFrameSlot | null>(null)

export function AuthFrame({ banner, children }: AuthFrameProps) {
  const [scene, setScene] = useState<OwlSceneName | null>(null)
  const [slot] = useState<AuthFrameSlot>(() => ({
    show: setScene,
    hide: () => setScene(null),
  }))
  const hasArt = scene !== null

  useEffect(() => {
    preloadOwlKits(AUTH_ENTRANCES)
  }, [])

  return (
    <AuthFrameContext value={slot}>
      <div
        data-slot={hasArt ? 'auth-layout' : 'auth-frame'}
        className={hasArt ? authLayoutVariants() : 'contents'}
      >
        {hasArt && banner}
        <div className={hasArt ? authGridVariants() : 'contents'}>
          {scene && <AuthArt scene={scene} />}
          {children}
        </div>
      </div>
    </AuthFrameContext>
  )
}

export function useWithoutAuthArt(): void {
  const frame = use(AuthFrameContext)
  useLayoutEffect(() => {
    frame?.hide()
  }, [frame])
}

export function AuthLayout({ scene, banner, className, ...main }: AuthLayoutProps) {
  useLightTheme()
  const frame = use(AuthFrameContext)

  useLayoutEffect(() => {
    if (!frame) {
      return
    }
    frame.show(scene)
  }, [frame, scene])

  if (frame) {
    return <AuthMain {...main} />
  }
  return (
    <div data-slot="auth-layout" className={cn(authLayoutVariants(), className)}>
      {banner}
      <div className={authGridVariants()}>
        <AuthArt scene={scene} />
        <AuthMain {...main} />
      </div>
    </div>
  )
}

function AuthArt({ scene }: AuthArtProps) {
  return (
    <div className={authArtVariants()}>
      <Logo className="hidden lg:block lg:self-start" />
      <OwlEntrance scene={scene} isOncePerSession className={authOwlVariants()} />
      <div className={authClaimVariants()}>
        <p className="font-display text-claim">{authLayoutMessages.claim}</p>
        <p className="text-claim-support">{authLayoutMessages.support}</p>
      </div>
    </div>
  )
}

function AuthMain({ title, subtitle, notice, footer, children }: AuthMainProps) {
  return (
    <main className={authMainVariants()}>
      <div className={authColumnVariants()}>
        <header>
          <h1 className={authTitleVariants()}>{title}</h1>
          <p className={authSubtitleVariants()}>{subtitle}</p>
        </header>
        {notice}
        {children}
        {footer && <p className={authFooterVariants()}>{footer}</p>}
      </div>
    </main>
  )
}
