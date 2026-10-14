import type { InstallOutcome, InstallPromptEvent } from '@web/lib/install-prompt.types'

const OFFERED_EVENT = 'beforeinstallprompt'
const INSTALLED_EVENT = 'appinstalled'

const listeners = new Set<() => void>()
let offer: InstallPromptEvent | null = null
let isListening = false

export function listenForInstallOffer(): void {
  if (isListening) {
    return
  }
  isListening = true
  window.addEventListener(OFFERED_EVENT, (event) => {
    event.preventDefault()
    keep(event as InstallPromptEvent)
  })
  window.addEventListener(INSTALLED_EVENT, () => keep(null))
}

export function subscribeToInstallOffer(onChange: () => void): () => void {
  listeners.add(onChange)
  return () => {
    listeners.delete(onChange)
  }
}

export function canInstall(): boolean {
  return offer !== null
}

export async function install(): Promise<InstallOutcome> {
  const offered = offer
  if (!offered) {
    return 'dismissed'
  }
  keep(null)
  await offered.prompt()
  return (await offered.userChoice).outcome
}

function keep(next: InstallPromptEvent | null): void {
  offer = next
  for (const listener of listeners) {
    listener()
  }
}
