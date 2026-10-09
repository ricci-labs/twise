import { type RefObject, useEffect } from 'react'

export function useMarkInView(
  containerRef: RefObject<HTMLElement | null>,
  isEnabled: boolean,
): void {
  useEffect(() => {
    const container = containerRef.current
    if (!isEnabled || !container || typeof IntersectionObserver === 'undefined') {
      return
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-in-view', '')
          observer.unobserve(entry.target)
        }
      }
    })
    for (const child of container.children) {
      observer.observe(child)
    }
    return () => observer.disconnect()
  }, [containerRef, isEnabled])
}
