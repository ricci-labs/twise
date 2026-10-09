import type { AppShellProps } from '@web/components/layout/app-shell/app-shell.types'
import {
  appShellFloatingVariants,
  appShellMainVariants,
  appShellVariants,
} from '@web/components/layout/app-shell/app-shell.variants'

export function AppShell({ sidebar, bottomBar, banner, floatingAction, children }: AppShellProps) {
  return (
    <div data-slot="app-shell" className={appShellVariants()}>
      <div className="hidden lg:flex">{sidebar}</div>
      <div className={appShellMainVariants()}>
        {banner}
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
      {floatingAction && <div className={appShellFloatingVariants()}>{floatingAction}</div>}
      {bottomBar}
    </div>
  )
}
