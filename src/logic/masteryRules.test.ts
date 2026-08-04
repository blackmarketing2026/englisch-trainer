import { describe, expect, it } from 'vitest'
import { applyCorrectAnswer, applyIncorrectAnswer } from './masteryRules'
import type { LearningItem } from '../types/learning'

function item(correctCount: number): LearningItem {
  return {
    id: '1',
    english: 'Hello',
    german: 'Hallo',
    status: 'active',
    correctCount,
    incorrectCount: 0,
    phaseOneViewCount: 0,
    createdAt: '2026-08-04T00:00:00.000Z',
    updatedAt: '2026-08-04T00:00:00.000Z',
  }
}

describe('mastery rules', () => {
  it('keeps an item active at 4 correct answers', () => {
    expect(applyCorrectAnswer(item(3), 5).status).toBe('active')
  })

  it('marks an item mastered at 5 correct answers', () => {
    expect(applyCorrectAnswer(item(4), 5).status).toBe('mastered')
  })

  it('does not reset correct answers after an incorrect answer', () => {
    expect(applyIncorrectAnswer(item(2)).correctCount).toBe(2)
  })

  it('removes mastered items from active status', () => {
    expect(applyCorrectAnswer(item(4), 5).status).not.toBe('active')
  })
})
