import { describe, expect, it } from 'vitest'
import { fillActivePool } from './learningPool'
import type { LearningItem, LearningItemStatus } from '../types/learning'

function make(status: LearningItemStatus, index: number): LearningItem {
  return {
    id: `${status}-${index}`,
    english: `${index}`,
    german: `${index}`,
    status,
    correctCount: 0,
    incorrectCount: 0,
    phaseOneViewCount: 0,
    createdAt: `2026-08-04T00:00:0${index}.000Z`,
    updatedAt: `2026-08-04T00:00:0${index}.000Z`,
    sortOrder: index,
  }
}

describe('active pool refill', () => {
  it('activates exactly one item when 8 active and 3 waiting exist', () => {
    const result = fillActivePool([...Array.from({ length: 8 }, (_, i) => make('active', i)), ...Array.from({ length: 3 }, (_, i) => make('waiting', i + 8))], 9)
    expect(result.activatedIds).toHaveLength(1)
  })

  it('activates four items when 5 active and 10 waiting exist', () => {
    const result = fillActivePool([...Array.from({ length: 5 }, (_, i) => make('active', i)), ...Array.from({ length: 10 }, (_, i) => make('waiting', i + 5))], 9)
    expect(result.activatedIds).toHaveLength(4)
  })

  it('keeps the list incomplete when no waiting items exist', () => {
    const result = fillActivePool(Array.from({ length: 5 }, (_, i) => make('active', i)), 9)
    expect(result.items.filter((entry) => entry.status === 'active')).toHaveLength(5)
  })

  it('never creates more active items than allowed', () => {
    const result = fillActivePool([...Array.from({ length: 9 }, (_, i) => make('active', i)), make('waiting', 10)], 9)
    expect(result.items.filter((entry) => entry.status === 'active')).toHaveLength(9)
  })
})
