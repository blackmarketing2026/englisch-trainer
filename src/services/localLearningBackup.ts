import type { LearningItem } from '../types/learning'

const LEARNING_ITEMS_BACKUP_KEY = 'english-trainer-learning-items-backup'

export function saveLearningItemsLocalBackup(items: LearningItem[]) {
  window.localStorage.setItem(LEARNING_ITEMS_BACKUP_KEY, JSON.stringify(items))
}

export function loadLearningItemsLocalBackup(): LearningItem[] {
  const raw = window.localStorage.getItem(LEARNING_ITEMS_BACKUP_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isLearningItem)
  } catch {
    return []
  }
}

export function clearLearningItemsLocalBackup() {
  window.localStorage.removeItem(LEARNING_ITEMS_BACKUP_KEY)
}

function isLearningItem(value: unknown): value is LearningItem {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<LearningItem>
  return typeof candidate.id === 'string' && typeof candidate.english === 'string' && typeof candidate.german === 'string'
}
