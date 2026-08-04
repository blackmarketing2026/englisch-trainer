import { describe, expect, it, vi } from 'vitest'
import { getNextLearningItem, scheduleIncorrect } from './itemSelection'
import type { LearningItem, LearningItemStatus } from '../types/learning'

function make(id: string, status: LearningItemStatus = 'active', correctCount = 0): LearningItem {
  return {
    id,
    english: id,
    german: id,
    status,
    correctCount,
    incorrectCount: 0,
    phaseOneViewCount: 0,
    createdAt: '2026-08-04T00:00:00.000Z',
    updatedAt: '2026-08-04T00:00:00.000Z',
  }
}

describe('item selection', () => {
  it('does not repeat the current item directly', () => {
    const next = getNextLearningItem({ activeItems: [make('a'), make('b')], currentItemId: 'a', recentlyShownItemIds: [], incorrectQueue: [] })
    expect(next?.id).toBe('b')
  })

  it('can schedule an incorrect item for later', () => {
    expect(scheduleIncorrect([], 'a')).toEqual(['a'])
  })

  it('works with only one item', () => {
    expect(getNextLearningItem({ activeItems: [make('a')], currentItemId: 'a', recentlyShownItemIds: ['a'], incorrectQueue: [] })?.id).toBe('a')
  })

  it('ignores paused and mastered items', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const next = getNextLearningItem({ activeItems: [make('a', 'paused'), make('b', 'mastered'), make('c')], recentlyShownItemIds: [], incorrectQueue: [] })
    expect(next?.id).toBe('c')
    vi.restoreAllMocks()
  })
})
