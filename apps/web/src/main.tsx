import { AppProviders } from '@web/app/providers'
import { listenForInstallOffer } from '@web/lib/install-prompt'
import '@web/styles/globals.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

listenForInstallOffer()

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element #root not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>,
)
