export type OwlSceneName =
  | 'welcome'
  | 'wait'
  | 'envelope'
  | 'offline'
  | 'signUp'
  | 'confirmed'
  | 'key'
  | 'linkExpired'
  | 'closed'
  | 'invitation'
  | 'together'
  | 'space'

export type OwlSceneProps = {
  scene: OwlSceneName
  className?: string
}
