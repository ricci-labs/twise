import type { OwlEntranceProps } from '@web/components/brand/owl-entrance/owl-entrance.types'
import { OwlKit, type OwlKitName } from '@web/components/brand/owl-kit'
import { OwlScene, type OwlSceneName } from '@web/components/brand/owl-scene'
import { useLeavingValue } from '@web/hooks/use-leaving-value'
import { useEffect, useState } from 'react'

const LEAVE_MS = 300

const ENTRANCES: Readonly<Partial<Record<OwlSceneName, OwlKitName>>> = {
  welcome: 'entrance-welcome',
  signUp: 'entrance-sign-up',
  key: 'entrance-key',
  offline: 'entrance-offline',
  wait: 'entrance-wait',
  linkExpired: 'entrance-link-expired',
  invitation: 'entrance-invitation',
  together: 'entrance-together',
  space: 'entrance-space',
  envelope: 'entrance-envelope',
}

const playedThisSession = new Set<OwlSceneName>()

export function OwlEntrance({
  scene,
  isOncePerSession = false,
  isStill = false,
  className,
}: OwlEntranceProps) {
  const [openingScene] = useState(scene)
  const [isFirstOpening] = useState(() => !playedThisSession.has(scene))
  const leavingScene = useLeavingValue(scene, (previous) => Boolean(ENTRANCES[previous]), LEAVE_MS)

  useEffect(() => {
    playedThisSession.add(openingScene)
  }, [openingScene])

  const leavingKit = leavingScene && ENTRANCES[leavingScene]
  if (leavingScene && leavingKit) {
    return (
      <OwlKit
        key={`leave-${leavingScene}`}
        kit={leavingKit}
        scene={leavingScene}
        motion="leave"
        className={className}
      />
    )
  }
  const kit = ENTRANCES[scene]
  const hasChanged = scene !== openingScene
  const plays = !isStill && (hasChanged || !isOncePerSession || isFirstOpening)
  if (!kit || !plays) {
    return <OwlScene scene={scene} className={className} />
  }
  return <OwlKit key={scene} kit={kit} scene={scene} hidesStillWhileLoading className={className} />
}
