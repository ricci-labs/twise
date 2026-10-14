import type { InstallOutcome } from '@web/lib/install-prompt.types'
import { vi } from 'vitest'

export function offerInstall(outcome: InstallOutcome = 'accepted') {
  const prompt = vi.fn(() => Promise.resolve())
  const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
    prompt,
    userChoice: Promise.resolve({ outcome, platform: 'web' }),
  })
  window.dispatchEvent(event)
  return { event, prompt }
}

export function finishInstall() {
  window.dispatchEvent(new Event('appinstalled'))
}
