import { Banner } from '@web/components/feedback/banner'
import { AppShell } from '@web/components/layout/app-shell/app-shell'
import { PageFrame } from '@web/components/layout/page-frame'
import { WifiOff } from 'lucide-react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const SIDEBAR_WIDTH = 264
const GAP_BELOW_BANNER = 24
const DESKTOP_TOP = 32

async function renderShell(banner?: ReactNode) {
  return render(
    <AppShell sidebar={<nav className="w-66">Menu</nav>} bottomBar={null} banner={banner}>
      <PageFrame>
        <h1>Início</h1>
      </PageFrame>
    </AppShell>,
  )
}

function topOf(selector: string): number {
  return (document.querySelector(selector) as HTMLElement).getBoundingClientRect().top
}

describe('AppShell', () => {
  afterEach(async () => {
    await page.viewport(414, 896)
  })

  it.each([1440, 1920])(
    'runs the desktop banner from the sidebar to the right edge at %i px, content 24 px below',
    async (width) => {
      await page.viewport(width, 900)
      await renderShell(<Banner icon={WifiOff}>Sem conexão.</Banner>)
      const banner = (
        document.querySelector('[data-slot=banner]') as HTMLElement
      ).getBoundingClientRect()

      expect(banner.top).toBe(0)
      expect(Math.round(banner.left)).toBe(SIDEBAR_WIDTH)
      expect(Math.round(banner.right)).toBe(width)
      expect(Math.round(topOf('h1') - banner.bottom)).toBe(GAP_BELOW_BANNER)
    },
  )

  it('keeps the desktop top margin when there is no banner', async () => {
    await page.viewport(1440, 900)
    await renderShell()

    expect(Math.round(topOf('h1'))).toBe(DESKTOP_TOP)
  })
})
