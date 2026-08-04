import type { LearningItem } from '../types/learning'
import { nowIso } from '../utils/dates'

export interface PoolFillResult {
  items: LearningItem[]
  activatedIds: string[]
}

export function fillActivePool(items: LearningItem[], activePoolSize: number): PoolFillResult {
  const activeCount = items.filter((item) => item.status === 'active').length
  const slots = Math.max(0, activePoolSize - activeCount)
  if (slots === 0) return { items, activatedIds: [] }

  const waiting = items
    .filter((item) => item.status === 'waiting')
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.createdAt.localeCompare(b.createdAt))
    .slice(0, slots)
  const activatedIds = waiting.map((item) => item.id)
  const timestamp = nowIso()

  return {
    activatedIds,
    items: items.map((item) =>
      activatedIds.includes(item.id)
        ? { ...item, status: 'active', updatedAt: timestamp }
        : item,
    ),
  }
}

export function enforceMasteryAfterRuleChange(
  items: LearningItem[],
  requiredCorrectAnswers: number,
  activePoolSize: number,
) {
  const timestamp = nowIso()
  const mastered = items.map((item) => {
    if (item.status === 'active' && item.correctCount >= requiredCorrectAnswers) {
      return { ...item, status: 'mastered' as const, masteredAt: item.masteredAt ?? timestamp, updatedAt: timestamp }
    }
    return item
  })
  return fillActivePool(mastered, activePoolSize)
}
