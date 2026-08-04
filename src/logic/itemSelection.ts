import type { LearningItem } from '../types/learning'

export interface NextItemOptions {
  activeItems: LearningItem[]
  currentItemId?: string
  recentlyShownItemIds: string[]
  incorrectQueue: string[]
}

function ageWeight(item: LearningItem) {
  if (!item.lastAnsweredAt && !item.lastShownAt) return 2
  const last = new Date(item.lastAnsweredAt ?? item.lastShownAt ?? 0).getTime()
  const hours = Math.max(0, (Date.now() - last) / 3_600_000)
  return Math.min(3, 1 + hours / 24)
}

export function getNextLearningItem(options: NextItemOptions): LearningItem | undefined {
  const active = options.activeItems.filter((item) => item.status === 'active')
  if (active.length === 0) return undefined
  if (active.length === 1) return active[0]

  const recentBlock = active.length >= 3 ? options.recentlyShownItemIds.slice(-2) : options.recentlyShownItemIds.slice(-1)
  const candidates = active.filter(
    (item) => item.id !== options.currentItemId && !recentBlock.includes(item.id),
  )
  const pool = candidates.length > 0 ? candidates : active.filter((item) => item.id !== options.currentItemId)
  const safePool = pool.length > 0 ? pool : active

  const weighted = safePool.map((item) => {
    const correctnessWeight = Math.max(1, 8 - item.correctCount)
    const wrongWeight = options.incorrectQueue.includes(item.id) ? 4 : 0
    const randomWeight = Math.random()
    return {
      item,
      score: correctnessWeight + ageWeight(item) + wrongWeight + randomWeight,
    }
  })

  return weighted.sort((a, b) => b.score - a.score)[0]?.item
}

export function scheduleIncorrect(queue: string[], itemId: string) {
  return queue.includes(itemId) ? queue : [...queue, itemId]
}
