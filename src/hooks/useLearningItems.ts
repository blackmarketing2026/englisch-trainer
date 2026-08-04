import { useCallback } from 'react'
import { getAllLearningItems, refillActivePool } from '../services/learningItemService'
import { useAsyncData } from './useAsyncData'

export function useLearningItems() {
  const loader = useCallback(async () => {
    await refillActivePool()
    return getAllLearningItems()
  }, [])
  const result = useAsyncData(loader, [])
  return {
    ...result,
    activeItems: result.data.filter((item) => item.status === 'active'),
    waitingItems: result.data.filter((item) => item.status === 'waiting'),
    masteredItems: result.data.filter((item) => item.status === 'mastered'),
    pausedItems: result.data.filter((item) => item.status === 'paused'),
  }
}
