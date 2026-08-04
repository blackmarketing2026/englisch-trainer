export type LearningItemStatus = 'waiting' | 'active' | 'mastered' | 'paused'

export interface LearningItem {
  id: string
  english: string
  german: string
  category?: string
  topic?: string
  note?: string
  example?: string
  status: LearningItemStatus
  correctCount: number
  incorrectCount: number
  phaseOneViewCount: number
  createdAt: string
  updatedAt: string
  lastShownAt?: string
  lastAnsweredAt?: string
  masteredAt?: string
  sortOrder?: number
}

export interface LearningItemDraft {
  english: string
  german: string
  category?: string
  topic?: string
  note?: string
  example?: string
}
