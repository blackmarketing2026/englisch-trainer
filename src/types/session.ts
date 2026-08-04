export type TrainingState =
  | 'idle'
  | 'phase1_running'
  | 'phase1_completed'
  | 'phase2_running'
  | 'phase2_completed'
  | 'phase3_running'
  | 'completed'

export interface PhaseTimerState {
  remainingSeconds: number
  targetTimestamp?: number
  paused: boolean
}

export interface LearningSession {
  id: string
  startedAt: string
  completedAt?: string
  state: TrainingState
  phaseOneDurationSeconds: number
  phaseTwoDurationSeconds: number
  phaseThreeDurationSeconds: number
  phaseOneCompleted: boolean
  phaseTwoCompleted: boolean
  phaseThreeCompleted: boolean
  shownItemIds: string[]
  correctItemIds: string[]
  incorrectItemIds: string[]
  masteredItemIds: string[]
  activatedItemIds: string[]
  freeSpeakingTopic?: string
  freeSpeakingNote?: string
  currentPhase?: 1 | 2 | 3
  currentItemId?: string
  phaseOneTimer?: PhaseTimerState
  phaseTwoTimer?: PhaseTimerState
  phaseThreeTimer?: PhaseTimerState
}
