import type { LearningItem } from '../types/learning'
import { nowIso } from '../utils/dates'

export function isMastered(item: LearningItem, requiredCorrectAnswers: number) {
  return item.correctCount >= requiredCorrectAnswers
}

export function applyCorrectAnswer(item: LearningItem, requiredCorrectAnswers: number): LearningItem {
  const updated: LearningItem = {
    ...item,
    correctCount: item.correctCount + 1,
    lastAnsweredAt: nowIso(),
    updatedAt: nowIso(),
  }
  if (updated.correctCount >= requiredCorrectAnswers) {
    return { ...updated, status: 'mastered', masteredAt: nowIso() }
  }
  return updated
}

export function applyIncorrectAnswer(item: LearningItem): LearningItem {
  return {
    ...item,
    incorrectCount: item.incorrectCount + 1,
    lastAnsweredAt: nowIso(),
    updatedAt: nowIso(),
  }
}
