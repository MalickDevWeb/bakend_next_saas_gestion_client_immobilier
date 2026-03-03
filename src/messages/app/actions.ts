export const ACTIONS = {
  CORRIGER: 'actions.corriger',
  RETENTER: 'actions.retenter',
} as const

export const ACTIONS_FR: Record<string, string> = {
  [ACTIONS.CORRIGER]: 'Corriger',
  [ACTIONS.RETENTER]: 'Retenter',
}

export const ACTIONS_EN: Record<string, string> = {
  [ACTIONS.CORRIGER]: 'Fix',
  [ACTIONS.RETENTER]: 'Retry',
}
